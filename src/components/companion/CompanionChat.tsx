"use client";

import { getMoodDetails } from "@/config/moods";
import { appendChatMessage, clearChatHistory, getChatMessages, getTodayMoodEntry } from "@/lib/storage";
import { ChatMessage, CompanionApiResponse, MoodEntry } from "@/types";
import {
  Send,
  Sparkles,
  Wind,
  Headphones,
  RotateCcw,
  Loader2,
  AlertCircle,
  Bot,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CompanionChatProps {
  onOpenBreathing: () => void;
  onOpenTakeABreak: () => void;
  onOpenCrisis: (reason?: string) => void;
}

const STARTER_PROMPTS = [
  "I'm feeling a little overwhelmed today",
  "Can you help me pause and unwind?",
  "I had a quiet day and just wanted to check in",
  "Feeling restless and trying to refocus",
];

export function CompanionChat({
  onOpenBreathing,
  onOpenTakeABreak,
  onOpenCrisis,
}: CompanionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history & today's mood
  useEffect(() => {
    async function initChat() {
      try {
        const stored = await getChatMessages();
        setMessages(stored);
        const mood = await getTodayMoodEntry();
        setTodayMood(mood);
      } catch (e) {
        console.error("Failed to load companion chat history:", e);
      }
    }
    initChat();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputText("");

    // Optimistically save and display user message
    const userMsg = await appendChatMessage({
      role: "user",
      content: text,
    });
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentMood: todayMood?.mood,
        }),
      });

      const data: CompanionApiResponse = await res.json();

      if (!res.ok && !data.message) {
        throw new Error(data.error || "The companion is temporarily unavailable.");
      }

      if (!data.configured) {
        setIsOfflineMode(true);
      }

      // 1. SAFETY ESCALATION CHECK
      if (data.safety?.isCrisis) {
        // Automatically activate dedicated crisis support modal
        onOpenCrisis(data.safety.reason);

        const crisisReply = await appendChatMessage({
          role: "assistant",
          content:
            data.message ||
            "I hear how much pain you're carrying right now. Please connect with immediate professional crisis support.",
          isSafetyEscalated: true,
        });
        setMessages((prev) => [...prev, crisisReply]);
        return;
      }

      // 2. Normal Companion response
      if (data.message) {
        const assistantMsg = await appendChatMessage({
          role: "assistant",
          content: data.message,
        });
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unable to reach the AI companion.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Clear this conversation history?")) {
      clearChatHistory();
      setMessages([]);
      setErrorMsg(null);
    }
  };

  const moodDetails = todayMood ? getMoodDetails(todayMood.mood) : null;

  return (
    <section className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-3xl flex-col px-4 py-4 sm:py-6">
      {/* Companion Header & Quick Interventions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Happy Mind Companion</span>
              {moodDetails && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${moodDetails.badgeBgClass}`}
                  title="Context from today's pulse check"
                >
                  {moodDetails.emoji} {moodDetails.label}
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Supportive listener • Non-clinical AI
            </p>
          </div>
        </div>

        {/* Quick Intervention Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 text-xs font-semibold transition-colors"
            title="1-minute guided breathing"
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Breathe</span>
          </button>

          <button
            onClick={onOpenTakeABreak}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 text-xs font-semibold transition-colors"
            title="Take a break with relaxing sounds"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Break</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Offline Mode Diagnostic Banner */}
      {isOfflineMode && (
        <div className="mt-2 rounded-xl bg-amber-50/80 border border-amber-200/80 px-3.5 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-200 flex items-center justify-between">
          <span>
            Offline Compassionate Mode active (Configure <code>GEMINI_API_KEY</code> for dynamic LLM responses).
          </span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-8">
            <div className="h-14 w-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
              Welcome to your quiet space
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
              I am here to listen without judgment. Share what is on your mind, or pick a starting thought below.
            </p>

            <div className="flex flex-col gap-2 w-full">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-3 rounded-2xl border border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-800 text-xs sm:text-sm text-stone-700 dark:text-stone-300 transition-all shadow-xs"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-emerald-800 text-white rounded-br-xs shadow-xs"
                      : msg.isSafetyEscalated
                      ? "bg-rose-50 border border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 rounded-bl-xs"
                      : "bg-white border border-stone-200/90 text-stone-800 dark:bg-stone-850 dark:border-stone-800 dark:text-stone-100 rounded-bl-xs shadow-xs"
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="h-8 w-8 rounded-xl bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading bubble */}
        {isLoading && (
          <div className="flex gap-3 items-center text-stone-500 text-xs">
            <div className="h-8 w-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
              <span>Companion is reflecting...</span>
            </div>
          </div>
        )}

        {/* Error state with retry */}
        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-950 dark:bg-rose-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share how you're feeling right now..."
            maxLength={1000}
            disabled={isLoading}
            className="w-full rounded-2xl border border-stone-300 bg-white py-3 pl-4 pr-24 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500 shadow-xs"
          />

          <div className="absolute right-2 flex items-center gap-2">
            <span className="text-[10px] text-stone-400 hidden sm:inline">
              {inputText.length}/1000
            </span>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Send message to Companion"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-[11px] text-stone-400 dark:text-stone-500">
          Happy Mind is an emotional support AI and cannot provide medical advice. If you feel unsafe, click &ldquo;Crisis Help&rdquo; above.
        </p>
      </div>
    </section>
  );
}
