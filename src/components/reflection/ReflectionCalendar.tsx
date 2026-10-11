"use client";

import { getMoodDetails } from "@/config/moods";
import {
  CalendarDay,
  MONTH_NAMES,
  WEEKDAYS,
  calculateMonthSummary,
  getMonthCalendarDays,
} from "@/lib/calendar";
import { getAllMoodEntries, getLocalDateString } from "@/lib/storage";
import { MoodEntry } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ReflectionCalendarProps {
  onSelectTodayToUpdate?: () => void;
}

export function ReflectionCalendar({ onSelectTodayToUpdate }: ReflectionCalendarProps) {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: October
  const [todayString, setTodayString] = useState<string>("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize dates and load user's mood entries
  useEffect(() => {
    async function loadData() {
      const now = new Date();
      setCurrentYear(now.getFullYear());
      setCurrentMonth(now.getMonth());
      setTodayString(getLocalDateString(now));

      try {
        setIsLoading(true);
        const all = await getAllMoodEntries();
        setEntries(all);
      } catch (err) {
        console.error("Failed to load mood records for reflection:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDay(null);
  };

  const calendarDays = getMonthCalendarDays(currentYear, currentMonth, entries, todayString);
  const summary = calculateMonthSummary(currentYear, currentMonth, entries);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Monthly Reflection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Mood Calendar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Reflect on how your emotional states have shifted over time.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-xs transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="min-w-[140px] text-center text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-xs transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={handleGoToCurrentMonth}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700 mb-3" />
          <p className="text-sm font-medium">Gathering your reflection history...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar Grid Card */}
          <div className="lg:col-span-2 rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-[11px] font-semibold tracking-wider text-stone-400 dark:text-stone-500 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((day) => {
                const hasEntry = Boolean(day.entry);
                const isSelected = selectedDay?.dateString === day.dateString;
                const moodDetail = day.entry ? getMoodDetails(day.entry.mood) : null;

                return (
                  <button
                    key={day.dateString}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`relative min-h-[64px] sm:min-h-[72px] p-1.5 rounded-2xl flex flex-col items-center justify-between transition-all text-left ${
                      !day.isCurrentMonth
                        ? "opacity-35 bg-stone-50/50 dark:bg-stone-950/20"
                        : hasEntry
                        ? "bg-stone-50/90 dark:bg-stone-850 hover:bg-stone-100"
                        : "bg-white dark:bg-stone-900 hover:bg-stone-50/80"
                    } ${
                      day.isToday
                        ? "ring-2 ring-emerald-600/70 dark:ring-emerald-400"
                        : "border border-stone-100 dark:border-stone-800"
                    } ${
                      isSelected
                        ? "ring-2 ring-stone-900 dark:ring-stone-100 shadow-sm"
                        : ""
                    }`}
                  >
                    {/* Day number & Today indicator */}
                    <div className="w-full flex justify-between items-center px-1">
                      <span
                        className={`text-xs font-semibold ${
                          day.isToday
                            ? "text-emerald-700 dark:text-emerald-400 font-bold"
                            : "text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      )}
                    </div>

                    {/* Mood Emoji or Empty slot */}
                    <div className="my-auto">
                      {moodDetail ? (
                        <span
                          className="text-xl sm:text-2xl transition-transform hover:scale-110"
                          title={`${moodDetail.label}`}
                        >
                          {moodDetail.emoji}
                        </span>
                      ) : (
                        <span className="text-stone-200 dark:text-stone-800 text-xs select-none">
                          •
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between text-[11px] text-stone-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full border border-emerald-600" /> Today
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-stone-300 dark:bg-stone-700" /> Selected
                </span>
              </div>
              <span>Click any date to see notes</span>
            </div>
          </div>

          {/* Right Column: Selected Day Details & Monthly Summary */}
          <div className="space-y-6">
            {/* Selected Day Inspector */}
            <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-3">
                <CalendarIcon className="h-4 w-4 text-emerald-700" />
                <span>
                  {selectedDay
                    ? new Date(selectedDay.dateString + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "Day Details"}
                </span>
              </h3>

              {selectedDay ? (
                selectedDay.entry ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700">
                      <span className="text-3xl">
                        {getMoodDetails(selectedDay.entry.mood).emoji}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {getMoodDetails(selectedDay.entry.mood).label}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {getMoodDetails(selectedDay.entry.mood).description}
                        </div>
                      </div>
                    </div>

                    {selectedDay.entry.note && (
                      <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                          Reflection Note
                        </span>
                        &ldquo;{selectedDay.entry.note}&rdquo;
                      </div>
                    )}

                    {selectedDay.dateString === todayString && onSelectTodayToUpdate && (
                      <button
                        onClick={onSelectTodayToUpdate}
                        className="w-full text-center py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Update today&apos;s check-in in Pulse Check →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-stone-400 space-y-2">
                    <p>No mood recorded for this date.</p>
                    {selectedDay.dateString === todayString && onSelectTodayToUpdate && (
                      <button
                        onClick={onSelectTodayToUpdate}
                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
                      >
                        Record Today&apos;s Mood
                      </button>
                    )}
                  </div>
                )
              ) : (
                <p className="text-xs text-stone-400 py-6 text-center">
                  Select any date on the calendar to inspect your entry and reflections.
                </p>
              )}
            </div>

            {/* Monthly Summary Card */}
            <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {MONTH_NAMES[currentMonth]} Summary
                </h3>
              </div>

              {summary.totalRecorded === 0 ? (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 text-xs text-stone-500 text-center leading-relaxed">
                  No check-ins recorded in {MONTH_NAMES[currentMonth]} {currentYear}. Visit Pulse Check to record how you feel.
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                    {summary.descriptiveText}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                      <div className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                        {summary.positiveCount}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Positive
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <div className="text-base font-bold text-stone-800 dark:text-stone-200">
                        {summary.neutralCount}
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">
                        Neutral
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
                      <div className="text-base font-bold text-rose-800 dark:text-rose-300">
                        {summary.difficultCount}
                      </div>
                      <div className="text-[11px] text-rose-700 dark:text-rose-400">
                        Difficult
                      </div>
                    </div>
                  </div>
                </>
              )}

              <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed pt-1">
                Reflection summaries are descriptive records of your past entries and do not establish a medical diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
