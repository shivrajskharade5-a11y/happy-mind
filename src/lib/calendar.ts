/**
 * Happy Mind - Calendar and Reflection Calculation Utilities
 * Handles month navigation, grid day alignment, and descriptive summaries.
 */

import { MoodEntry, MoodType } from "@/types";
import { getLocalDateString } from "./storage";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface CalendarDay {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  entry?: MoodEntry;
}

/**
 * Generates the full 35-42 calendar grid cells for a given year and month (0-indexed).
 */
export function getMonthCalendarDays(
  year: number,
  monthIndex: number,
  entries: MoodEntry[] = [],
  todayDateStr?: string
): CalendarDay[] {
  const entryMap = new Map<string, MoodEntry>();
  for (const e of entries) {
    entryMap.set(e.date, e);
  }

  const todayStr = todayDateStr ?? "";
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Days from previous month to fill first row
  const totalDaysInPrevMonth = new Date(year, monthIndex, 0).getDate();
  const grid: CalendarDay[] = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = totalDaysInPrevMonth - i;
    const prevMonthDate = new Date(year, monthIndex - 1, dayNum);
    const dateStr = getLocalDateString(prevMonthDate);
    grid.push({
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      entry: entryMap.get(dateStr),
    });
  }

  // Days in current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const curDate = new Date(year, monthIndex, d);
    const dateStr = getLocalDateString(curDate);
    grid.push({
      dateString: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      entry: entryMap.get(dateStr),
    });
  }

  // Days from next month to complete the last row (up to multiple of 7)
  const remainingCells = (7 - (grid.length % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
    const nextMonthDate = new Date(year, monthIndex + 1, nextDay);
    const dateStr = getLocalDateString(nextMonthDate);
    grid.push({
      dateString: dateStr,
      dayNumber: nextDay,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      entry: entryMap.get(dateStr),
    });
  }

  return grid;
}

export interface ReflectionSummary {
  totalRecorded: number;
  positiveCount: number; // good + very_good
  neutralCount: number; // neutral
  difficultCount: number; // difficult + very_difficult
  countsByMood: Record<MoodType, number>;
  descriptiveText: string;
}

/**
 * Calculates honest, descriptive monthly summary without medical claims.
 */
export function calculateMonthSummary(
  year: number,
  monthIndex: number,
  entries: MoodEntry[]
): ReflectionSummary {
  // Filter entries strictly belonging to this year and month
  const targetPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((e) => e.date.startsWith(targetPrefix));

  const counts: Record<MoodType, number> = {
    very_good: 0,
    good: 0,
    neutral: 0,
    difficult: 0,
    very_difficult: 0,
  };

  for (const e of monthEntries) {
    if (counts[e.mood] !== undefined) {
      counts[e.mood]++;
    }
  }

  const positive = counts.very_good + counts.good;
  const neutral = counts.neutral;
  const difficult = counts.difficult + counts.very_difficult;
  const total = monthEntries.length;

  let descriptiveText = "No moods recorded for this month yet.";

  if (total > 0) {
    if (positive > difficult && positive >= neutral) {
      descriptiveText = `You recorded more positive moods (${positive}) than difficult moods (${difficult}) this month.`;
    } else if (difficult > positive && difficult >= neutral) {
      descriptiveText = `This month had some challenging days (${difficult} difficult moods recorded). Remember to be gentle with yourself.`;
    } else if (neutral >= positive && neutral >= difficult) {
      descriptiveText = `Your month was mostly steady and balanced (${neutral} neutral check-ins recorded).`;
    } else {
      descriptiveText = `You recorded a balance of different emotional states across ${total} days this month.`;
    }
  }

  return {
    totalRecorded: total,
    positiveCount: positive,
    neutralCount: neutral,
    difficultCount: difficult,
    countsByMood: counts,
    descriptiveText,
  };
}
