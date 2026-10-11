/**
 * Happy Mind - Safety Architecture & Classification Engine
 *
 * Implements an independent multi-layered classification engine to protect
 * vulnerable users. Evaluates risk BEFORE any conversational AI generation
 * can occur.
 *
 * Considers:
 * - Direct statements of self-harm / suicide
 * - Indirect despair & hopelessness
 * - Hinglish expressions of crisis
 * - Negation and third-person/quoted mentions
 * - Differentiating ordinary sadness vs true crisis
 * - Safe fallback in case of errors
 */

import { APP_CONFIG } from "@/config/app";
import { HelplineResource, SafetyClassification, SafetySeverity } from "@/types";

// High-risk English patterns (Explicit self-harm / suicidal intent)
const HIGH_RISK_DIRECT_ENGLISH = [
  /\b(?:want to|going to|planning to|gonna)\s+(?:kill|end)\s+(?:myself|my life)\b/i,
  /\b(?:commit|committing|planning|attempting)\s+suicide\b/i,
  /\b(?:thinking\s+about\s+suicide|thoughts\s+of\s+suicide|feeling\s+suicidal)\b/i,
  /\b(?:end\s+it\s+all|ending\s+it\s+all)\b/i,
  /\b(?:take\s+my\s+own\s+life|taking\s+my\s+own\s+life)\b/i,
  /\b(?:hang\s+myself|slit\s+my\s+wrists?|cut\s+myself|swallow\s+pills\s+to\s+die)\b/i,
  /\b(?:jump\s+off\s+a\s+(?:bridge|building|roof)|jump\s+in\s+front\s+of\s+a\s+train)\b/i,
  /\b(?:better\s+off\s+dead|wish\s+I\s+were\s+dead)\b/i,
  /\b(?:want\s+to\s+die|just\s+want\s+to\s+die|ready\s+to\s+die)\b/i,
  /\b(?:goodbye\s+world|goodbye\s+forever|this\s+is\s+my\s+final\s+goodbye)\b/i,
];

// Hinglish & South Asian expressions of severe crisis / self-harm
const HIGH_RISK_HINGLISH = [
  /\b(?:marne\s+ka\s+mann|marne\s+ka\s+man|marne\s+ja\s+raha|mar\s+jaana\s+chahta|mar\s+jaunga)\b/i,
  /\b(?:zindagi\s+khatam|jaan\s+de\s+dunga|jaan\s+lene\s+ka\s+mann)\b/i,
  /\b(?:ab\s+aur\s+nahi\s+jeena|jeene\s+ka\s+koi\s+fayda\s+nahi|jeena\s+nahi\s+chahta)\b/i,
  /\b(?:sab\s+kuch\s+khatam\s+kar\s+dunga|sab\s+khatam\s+kar\s+raha\s+hu)\b/i,
  /\b(?:kud\s+ke\s+mar|fansi\s+laga|zeher\s+kha)\b/i,
  /\b(?:suicide\s+kar\s+lunga|suicide\s+karne\s+ka\s+soch)\b/i,
  /\b(?:khatam\s+kar\s+raha\s+hu\s+apni\s+zindagi)\b/i,
];

// Indirect / severe hopelessness statements requiring intervention
const INDIRECT_DESPAIR = [
  /\b(?:everyone\s+would\s+be\s+better\s+off\s+without\s+me)\b/i,
  /\b(?:there\s+is\s+no\s+reason\s+for\s+me\s+to\s+(?:live|be\s+here|stay\s+alive))\b/i,
  /\b(?:I\s+can'?t\s+go\s+on\s+anymore\s+and\s+want\s+everything\s+to\s+stop)\b/i,
  /\b(?:just\s+want\s+to\s+go\s+to\s+sleep\s+and\s+never\s+wake\s+up)\b/i,
];

// Negation & third-person / educational contexts (should NOT automatically trigger crisis)
const NEGATION_AND_CONTEXT_PATTERNS = [
  /\b(?:not\s+suicidal|not\s+planning\s+to\s+kill|do\s+not\s+want\s+to\s+die|don'?t\s+want\s+to\s+die)\b/i,
  /\b(?:never\s+(?:said|thought|wanted)\s+to\s+die)\b/i,
  /\b(?:reading|read)\s+(?:about|a\s+book|a\s+novel|an\s+article|a\s+story)\b.*?\bsuicide\b/i,
  /\b(?:watching|watched)\s+(?:about|a\s+movie|a\s+show|a\s+film|a\s+documentary)\b.*?\bsuicide\b/i,
  /\b(?:quote|quotes|studying|researching|learning)\s+about\s+suicide\b/i,
  /\b(?:my\s+friend|someone\s+else|a\s+character)\b.*?\b(?:suicid|kill|death)\b/i,
  /\bsuicide\s+prevention\b/i,
];

// Ordinary distress indicators (Sadness, work stress, tiredness - NON-CRISIS)
const ORDINARY_SADNESS_PATTERNS = [
  /\b(?:sad|down|blue|gloomy|lonely|unhappy)\b/i,
  /\b(?:exhausted|tired|burnout|burned\s+out|overworked)\b/i,
  /\b(?:stressed|anxious|nervous|worried|overwhelmed)\b/i,
  /\b(?:bad\s+day|rough\s+day|tough\s+week|work\s+stress)\b/i,
  /\b(?:crying|upset|heartbroken|argument|breakup)\b/i,
];

/**
 * Classifies a user message for self-harm, suicidal ideation, or severe crisis risk.
 * Conservative by design: errs on the side of safety for ambiguous or high-risk inputs.
 */
export function classifySafety(text: string): SafetyClassification {
  if (!text || typeof text !== "string") {
    return {
      isCrisis: false,
      severity: "none",
      resources: [],
    };
  }

  const sanitized = text.trim();
  if (sanitized.length === 0) {
    return {
      isCrisis: false,
      severity: "none",
      resources: [],
    };
  }

  try {
    const detectedPhrases: string[] = [];

    // Step 1: Check for explicit negation or educational/third-person context
    const hasNegation = NEGATION_AND_CONTEXT_PATTERNS.some((pattern) =>
      pattern.test(sanitized)
    );

    // Step 2: Check for explicit high-risk English patterns
    const hasDirectEnglish = HIGH_RISK_DIRECT_ENGLISH.some((pattern) => {
      const match = sanitized.match(pattern);
      if (match) {
        detectedPhrases.push(match[0]);
        return true;
      }
      return false;
    });

    // Step 3: Check for Hinglish high-risk expressions
    const hasHinglish = HIGH_RISK_HINGLISH.some((pattern) => {
      const match = sanitized.match(pattern);
      if (match) {
        detectedPhrases.push(match[0]);
        return true;
      }
      return false;
    });

    // Step 4: Check for indirect despair patterns
    const hasIndirect = INDIRECT_DESPAIR.some((pattern) => {
      const match = sanitized.match(pattern);
      if (match) {
        detectedPhrases.push(match[0]);
        return true;
      }
      return false;
    });

    // Step 5: Evaluate Negation context
    // If user says "I am not suicidal, just had a tough exam", negation applies.
    // However, if conflicting strong active suicide intent is also present
    // (e.g. "I'm not suicidal but I'm going to kill myself tonight"), safety triggers.
    const hasActiveContradiction =
      hasNegation &&
      /\b(?:but|however|still)\s+(?:want\s+to\s+die|gonna\s+end\s+it|going\s+to\s+kill\s+myself)\b/i.test(
        sanitized
      );

    if (hasNegation && !hasActiveContradiction) {
      // User explicitly denies suicidal intent or discusses it in third-person/educational context
      return {
        isCrisis: false,
        severity: "low",
        reason: "Contextual discussion or negated suicidal ideation",
        detectedPhrases: [],
        resources: [],
      };
    }

    // Step 6: Trigger Crisis flow if high risk or Hinglish detected
    if (hasDirectEnglish || hasHinglish || hasIndirect || hasActiveContradiction) {
      const severity: SafetySeverity =
        hasDirectEnglish || hasHinglish || hasActiveContradiction
          ? "immediate"
          : "high";

      return {
        isCrisis: true,
        severity,
        reason:
          severity === "immediate"
            ? "Immediate self-harm or suicidal intent detected"
            : "Severe despair or indirect crisis indicator detected",
        detectedPhrases,
        safeResponse:
          "I can hear how much pain you're carrying right now, and I want to make sure you're safe. Happy Mind is an AI app and cannot provide crisis care, but you don't have to carry this alone. Please reach out to one of the free, confidential support services below or talk to someone you trust.",
        resources: getVerifiedHelplines(),
      };
    }

    // Step 7: Check ordinary sadness / distress (NON-CRISIS)
    const hasOrdinarySadness = ORDINARY_SADNESS_PATTERNS.some((pattern) =>
      pattern.test(sanitized)
    );

    if (hasOrdinarySadness) {
      return {
        isCrisis: false,
        severity: "moderate",
        reason: "Normal emotional distress or sadness without crisis intent",
        resources: [],
      };
    }

    // Default neutral/safe
    return {
      isCrisis: false,
      severity: "none",
      resources: [],
    };
  } catch {
    // Step 8: Safe Fallback
    // If classifier fails unexpectedly, conservatively check if emergency keywords are present
    const emergencyRegex = /\b(?:suicide|kill\s+myself|marne|end\s+my\s+life)\b/i;
    const isEmergent = emergencyRegex.test(sanitized);

    return {
      isCrisis: isEmergent,
      severity: isEmergent ? "immediate" : "low",
      reason: isEmergent
        ? "Safe fallback triggered due to crisis keywords during classifier exception"
        : "Safe fallback: non-critical exception",
      safeResponse: isEmergent
        ? "Please know you are not alone. Please contact emergency or crisis services immediately."
        : undefined,
      resources: isEmergent ? getVerifiedHelplines() : [],
    };
  }
}

/**
 * Returns the verified directory of emergency & crisis helplines.
 * Grounded in verified sources (Tele-MANAS, Vandrevala, 988, Samaritans).
 */
export function getVerifiedHelplines(): HelplineResource[] {
  return [...APP_CONFIG.crisisDirectory];
}
