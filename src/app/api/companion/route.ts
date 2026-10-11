/**
 * Happy Mind - Server-side AI Companion Endpoint
 *
 * Security & Architecture:
 * - Completely server-side. Never exposes API keys to client.
 * - Multi-layer safety gate: evaluates crisis risk BEFORE calling LLM.
 * - Rate limiting / payload size validation (max 1000 characters).
 * - Pluggable provider support: Google Gemini API & OpenAI.
 * - Transparent offline fallback when API key is unconfigured.
 */

import { APP_CONFIG } from "@/config/app";
import { classifySafety } from "@/lib/safety";
import { CompanionApiResponse, MoodType } from "@/types";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the AI Companion in "Happy Mind", a calm, supportive emotional-wellness application.
Your core principles:
1. Empathy & Listening: Listen first. Acknowledge and validate the user's stated feelings gently without exaggerating them or minimizing them.
2. Brevity & Clarity: Keep your responses relatively short (2 to 4 sentences). Do not overwhelm the user with long bulleted lists, complicated homework, or essays.
3. Tone: Calm, warm, grounded, and non-judgmental. Avoid toxic or forced positivity ("Everything happens for a reason!", "Just smile!").
4. Boundaries: You are an AI companion, NOT a therapist, doctor, or crisis counselor. Never claim to diagnose, treat, or cure mental health conditions. Never claim to have human personal experiences or physical feelings.
5. Inquiries: When helpful, ask a gentle, relevant follow-up question that helps the user pause and reflect on how they are feeling right now.
6. Interventions: When the user feels stressed or tense, you may remind them they can try Happy Mind's 1-minute guided breathing exercise or take a calming break.`;

interface RequestBody {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  currentMood?: MoodType;
}

/**
 * Offline empathetic fallback generator when no API key is configured
 */
function generateOfflineEmpatheticResponse(
  message: string,
  mood?: MoodType
): string {
  const lower = message.toLowerCase();

  if (lower.includes("breath") || lower.includes("anxious") || lower.includes("panic")) {
    return "It sounds like things are feeling really heavy right now. Would it feel helpful to pause for a moment and try the 1-minute breathing exercise in the top bar?";
  }
  if (lower.includes("tired") || lower.includes("exhaust") || lower.includes("sleep")) {
    return "Rest is so essential, and it's okay to allow yourself to slow down today. How can you give yourself a small pocket of rest this evening?";
  }
  if (lower.includes("work") || lower.includes("stress") || lower.includes("busy")) {
    return "When demands pile up, it is easy to feel carried away by the rush. What is one small thing you can let go of for the next hour?";
  }
  if (mood === "very_difficult" || mood === "difficult") {
    return "Thank you for sharing that with me. It takes courage to acknowledge when things feel rough. I'm here with you—what feels like the most challenging part of today?";
  }
  if (mood === "good" || mood === "very_good") {
    return "I'm really glad you're feeling some lightness today. What brought you that sense of warmth or ease?";
  }

  return "Thank you for checking in. I'm listening. How has your day felt so far, and how does your body feel right now?";
}

export async function POST(req: NextRequest): Promise<NextResponse<CompanionApiResponse>> {
  try {
    const body = (await req.json()) as RequestBody;
    const { message, history = [], currentMood } = body;

    // 1. Validate Input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          configured: true,
          error: "Please provide a non-empty message.",
        },
        { status: 400 }
      );
    }

    if (message.length > APP_CONFIG.features.companion.maxMessageLength) {
      return NextResponse.json(
        {
          success: false,
          configured: true,
          error: `Message exceeds the ${APP_CONFIG.features.companion.maxMessageLength} character limit.`,
        },
        { status: 400 }
      );
    }

    // 2. CRITICAL SAFETY GATE: Check safety BEFORE calling any LLM
    const safety = classifySafety(message);
    if (safety.isCrisis) {
      return NextResponse.json({
        success: true,
        safety,
        configured: true,
        message:
          safety.safeResponse ||
          "I hear how much pain you're in right now. Please connect with immediate professional crisis support.",
      });
    }

    // 3. Check for API keys
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no provider keys configured, use safe offline empathetic mode
    if (!geminiKey && !openaiKey) {
      const fallbackReply = generateOfflineEmpatheticResponse(
        message,
        currentMood
      );

      return NextResponse.json({
        success: true,
        configured: false,
        provider: "compassionate-offline",
        message: fallbackReply,
      });
    }

    // 4. Provider: Google Gemini API (v1beta)
    if (geminiKey) {
      try {
        const moodContext = currentMood
          ? `[Context: The user checked in with today's mood as: "${currentMood}"]\n\n`
          : "";

        // Format conversation contents for Gemini
        const contents = [
          ...history.slice(-6).map((h) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [{ text: `${moodContext}${message}` }],
          },
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250,
              },
            }),
            signal: AbortSignal.timeout(12000), // 12 second timeout
          }
        );

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.error("Gemini API Error:", geminiRes.status, errText);
          throw new Error(`AI service responded with status ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!candidateText) {
          throw new Error("Received empty response from AI service.");
        }

        return NextResponse.json({
          success: true,
          configured: true,
          provider: "gemini",
          message: candidateText,
        });
      } catch (geminiError) {
        console.warn("Gemini call failed, falling back to compassionate handler:", geminiError);
        const fallbackReply = generateOfflineEmpatheticResponse(
          message,
          currentMood
        );
        return NextResponse.json({
          success: true,
          configured: true,
          provider: "compassionate-offline",
          message: fallbackReply,
        });
      }
    }

    // 5. Provider: OpenAI compatible
    if (openaiKey) {
      try {
        const messages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.slice(-6).map((h) => ({
            role: h.role,
            content: h.content,
          })),
          {
            role: "user",
            content: currentMood
              ? `[Today's recorded mood: ${currentMood}] ${message}`
              : message,
          },
        ];

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 250,
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (!openaiRes.ok) {
          throw new Error(`OpenAI responded with status ${openaiRes.status}`);
        }

        const data = await openaiRes.json();
        const candidateText = data?.choices?.[0]?.message?.content?.trim();

        if (!candidateText) {
          throw new Error("Received empty response from OpenAI.");
        }

        return NextResponse.json({
          success: true,
          configured: true,
          provider: "openai",
          message: candidateText,
        });
      } catch (openaiErr) {
        console.warn("OpenAI call failed, falling back:", openaiErr);
        const fallbackReply = generateOfflineEmpatheticResponse(
          message,
          currentMood
        );
        return NextResponse.json({
          success: true,
          configured: true,
          provider: "compassionate-offline",
          message: fallbackReply,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        configured: false,
        error: "No AI provider available.",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Companion route error:", error);
    return NextResponse.json(
      {
        success: false,
        configured: false,
        error: "An unexpected error occurred while processing your message.",
      },
      { status: 500 }
    );
  }
}
