import { describe, expect, it } from "vitest";
import { calculateMonthSummary, getMonthCalendarDays } from "../src/lib/calendar";
import { MoodEntry } from "../src/types";

describe("Calendar & Reflection Calculations", () => {
  it("generates correct number of grid days for a given month", () => {
    // October 2026: 31 days. Starts on Thursday (day 4).
    const days = getMonthCalendarDays(2026, 9, []); // 9 = October
    expect(days.length % 7).toBe(0); // Must be a complete weekly grid
    expect(days.length).toBeGreaterThanOrEqual(35);

    const octDays = days.filter((d) => d.isCurrentMonth);
    expect(octDays.length).toBe(31);
  });

  it("calculates descriptive summaries accurately from saved data", () => {
    const mockEntries: MoodEntry[] = [
      {
        id: "1",
        userId: "u1",
        date: "2026-10-01",
        mood: "good",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        userId: "u1",
        date: "2026-10-02",
        mood: "very_good",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "3",
        userId: "u1",
        date: "2026-10-03",
        mood: "difficult",
        createdAt: "",
        updatedAt: "",
      },
    ];

    const summary = calculateMonthSummary(2026, 9, mockEntries);
    expect(summary.totalRecorded).toBe(3);
    expect(summary.positiveCount).toBe(2);
    expect(summary.difficultCount).toBe(1);
    expect(summary.neutralCount).toBe(0);
    expect(summary.descriptiveText).toContain("more positive moods (2) than difficult moods (1)");
  });

  it("provides appropriate empty summary state when no entries exist", () => {
    const summary = calculateMonthSummary(2026, 9, []);
    expect(summary.totalRecorded).toBe(0);
    expect(summary.descriptiveText).toBe("No moods recorded for this month yet.");
  });
});
