/**
 * Happy Mind - Mood Definitions & Visual Design Tokens
 * 5 distinct emotional states with emojis, text labels, and accessible styling.
 */

import { MoodOption, MoodType } from "@/types";

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: "very_difficult",
    emoji: "🌧️",
    label: "Very difficult",
    description: "Heavy, struggling, or feeling deeply overwhelmed",
    score: 1,
    colorClass: "text-indigo-700 dark:text-indigo-300",
    activeBgClass: "bg-indigo-50 dark:bg-indigo-950/40",
    activeBorderClass: "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-300/50",
    badgeBgClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
  },
  {
    value: "difficult",
    emoji: "⛅",
    label: "A little difficult",
    description: "Low energy, stressed, or feeling uneasy",
    score: 2,
    colorClass: "text-sky-700 dark:text-sky-300",
    activeBgClass: "bg-sky-50 dark:bg-sky-950/40",
    activeBorderClass: "border-sky-400 dark:border-sky-500 ring-2 ring-sky-300/50",
    badgeBgClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  },
  {
    value: "neutral",
    emoji: "🌿",
    label: "Neutral",
    description: "Steady, okay, or simply taking things as they come",
    score: 3,
    colorClass: "text-emerald-700 dark:text-emerald-300",
    activeBgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    activeBorderClass: "border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-300/50",
    badgeBgClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  },
  {
    value: "good",
    emoji: "☀️",
    label: "Good",
    description: "Pleasant, content, or feeling balanced and light",
    score: 4,
    colorClass: "text-amber-700 dark:text-amber-300",
    activeBgClass: "bg-amber-50 dark:bg-amber-950/40",
    activeBorderClass: "border-amber-400 dark:border-amber-500 ring-2 ring-amber-300/50",
    badgeBgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  },
  {
    value: "very_good",
    emoji: "🌸",
    label: "Very good",
    description: "Joyful, energized, or feeling deeply grateful",
    score: 5,
    colorClass: "text-rose-700 dark:text-rose-300",
    activeBgClass: "bg-rose-50 dark:bg-rose-950/40",
    activeBorderClass: "border-rose-400 dark:border-rose-500 ring-2 ring-rose-300/50",
    badgeBgClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  },
];

export const MOOD_MAP = new Map<MoodType, MoodOption>(
  MOOD_OPTIONS.map((opt) => [opt.value, opt])
);

export function getMoodDetails(mood: MoodType): MoodOption {
  return (
    MOOD_MAP.get(mood) || {
      value: "neutral",
      emoji: "🌿",
      label: "Neutral",
      description: "Steady",
      score: 3,
      colorClass: "text-emerald-700",
      activeBgClass: "bg-emerald-50",
      activeBorderClass: "border-emerald-400",
      badgeBgClass: "bg-emerald-100 text-emerald-800",
    }
  );
}
