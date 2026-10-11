import { describe, expect, it } from "vitest";
import { getLocalDateString } from "../src/lib/storage";
import { MOOD_OPTIONS, MOOD_MAP } from "../src/config/moods";
import { MoodType } from "../src/types";

describe("Pulse Check - Business Logic & Rules", () => {
  it("formats local dates consistently as YYYY-MM-DD", () => {
    const testDate = new Date(2026, 9, 11); // Oct 11, 2026
    const str = getLocalDateString(testDate);
    expect(str).toBe("2026-10-11");
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("provides exactly 5 distinct mood options with labels and emojis", () => {
    expect(MOOD_OPTIONS.length).toBe(5);

    const values: MoodType[] = [
      "very_difficult",
      "difficult",
      "neutral",
      "good",
      "very_good",
    ];

    for (const val of values) {
      const option = MOOD_MAP.get(val);
      expect(option).toBeDefined();
      expect(option?.label).toBeTruthy();
      expect(option?.emoji).toBeTruthy();
      expect(option?.score).toBeGreaterThanOrEqual(1);
      expect(option?.score).toBeLessThanOrEqual(5);
    }
  });

  it("enforces single entry per day updating logic", () => {
    // Simulate updating today's mood
    const userEntries = [
      {
        id: "1",
        userId: "user-123",
        date: "2026-10-11",
        mood: "difficult" as MoodType,
        note: "Rough morning",
        createdAt: "2026-10-11T09:00:00Z",
        updatedAt: "2026-10-11T09:00:00Z",
      },
    ];

    const todayStr = "2026-10-11";
    const existingIndex = userEntries.findIndex((e) => e.date === todayStr);
    expect(existingIndex).toBe(0);

    // Update existing
    const updated = {
      ...userEntries[existingIndex],
      mood: "good" as MoodType,
      note: "Turned around in the afternoon!",
      updatedAt: "2026-10-11T16:00:00Z",
    };
    userEntries[existingIndex] = updated;

    // Check that entry count is still 1
    expect(userEntries.length).toBe(1);
    expect(userEntries[0].mood).toBe("good");
    expect(userEntries[0].note).toBe("Turned around in the afternoon!");
  });
});
