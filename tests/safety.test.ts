/**
 * Automated Test Suite: Happy Mind Safety Architecture
 * Covers:
 * - Clear high-risk statements
 * - Ambiguous expressions of distress
 * - Hinglish crisis expressions
 * - Negation and educational/quoted statements
 * - Ordinary sadness (non-crisis)
 * - Safe fallback behavior
 */

import { describe, expect, it } from "vitest";
import { classifySafety } from "../src/lib/safety";

describe("Safety Engine - Crisis Detection", () => {
  it("detects explicit English suicidal ideation and intent", () => {
    const highRiskInputs = [
      "I want to kill myself tonight",
      "Thinking about suicide and have a plan",
      "I am going to end my life",
      "I just want to die and end it all",
      "Goodbye world, this is my final goodbye",
      "I want to jump off a bridge",
    ];

    for (const input of highRiskInputs) {
      const result = classifySafety(input);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe("immediate");
      expect(result.resources.length).toBeGreaterThan(0);
      expect(result.safeResponse).toBeDefined();
    }
  });

  it("detects Hinglish crisis expressions accurately", () => {
    const hinglishInputs = [
      "marne ka mann kar raha hai ab",
      "zindagi khatam karni hai mujhe",
      "ab aur nahi jeena mujhe, sab kuch khatam kar dunga",
      "mar jaana chahta hoon sab chhod ke",
      "suicide karne ka soch raha hu",
      "kud ke mar jaunga ab",
    ];

    for (const input of hinglishInputs) {
      const result = classifySafety(input);
      expect(result.isCrisis).toBe(true);
      expect(result.severity).toBe("immediate");
      expect(result.resources.length).toBeGreaterThan(0);
    }
  });

  it("detects indirect severe despair and hopelessness", () => {
    const indirectInputs = [
      "Everyone would be better off without me",
      "There is no reason for me to stay alive anymore",
      "I just want to go to sleep and never wake up",
      "I can't go on anymore and want everything to stop",
    ];

    for (const input of indirectInputs) {
      const result = classifySafety(input);
      expect(result.isCrisis).toBe(true);
      expect(result.resources.length).toBeGreaterThan(0);
    }
  });

  it("handles negation and does not trigger false crisis for educational/negated statements", () => {
    const negatedInputs = [
      "I am not suicidal, I just had a really stressful day at work",
      "I do not want to die, just feeling exhausted",
      "I was reading a novel where a character committed suicide",
      "We were watching a documentary about suicide prevention in school",
      "My friend was talking about suicide prevention resources",
    ];

    for (const input of negatedInputs) {
      const result = classifySafety(input);
      expect(result.isCrisis).toBe(false);
    }
  });

  it("correctly identifies active suicidal intent even when accompanied by pseudo-negation", () => {
    // Conflicting statement where suicide intent is affirmed despite saying 'not'
    const contradictory =
      "I said I'm not suicidal but I still want to die and end it all tonight";
    const result = classifySafety(contradictory);
    expect(result.isCrisis).toBe(true);
  });

  it("does NOT classify ordinary sadness, fatigue, or stress as crisis", () => {
    const normalSadnessInputs = [
      "I had a terrible day at work today",
      "I am feeling really sad and blue",
      "I had an argument with my best friend and feel heartbroken",
      "I'm so exhausted and burnt out from exams",
      "Feeling anxious about my presentation tomorrow",
      "I feel lonely this evening",
    ];

    for (const input of normalSadnessInputs) {
      const result = classifySafety(input);
      expect(result.isCrisis).toBe(false);
      expect(result.severity).not.toBe("immediate");
    }
  });

  it("handles empty, whitespace, and null-like inputs gracefully", () => {
    expect(classifySafety("").isCrisis).toBe(false);
    expect(classifySafety("   ").isCrisis).toBe(false);
    // @ts-expect-error test invalid type
    expect(classifySafety(null).isCrisis).toBe(false);
  });

  it("verifies crisis directory contains valid, named resources", () => {
    const result = classifySafety("I want to end my life");
    expect(result.resources.length).toBeGreaterThanOrEqual(4);

    const hasIndiaResource = result.resources.some((r) => r.countryCode === "IN");
    const hasUSResource = result.resources.some((r) => r.countryCode === "US");
    const hasUKResource = result.resources.some((r) => r.countryCode === "UK");
    const hasGlobal = result.resources.some((r) => r.countryCode === "GLOBAL");

    expect(hasIndiaResource).toBe(true);
    expect(hasUSResource).toBe(true);
    expect(hasUKResource).toBe(true);
    expect(hasGlobal).toBe(true);
  });
});
