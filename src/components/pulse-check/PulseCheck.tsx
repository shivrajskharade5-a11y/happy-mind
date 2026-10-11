"use client";

import { MOOD_OPTIONS, getMoodDetails } from "@/config/moods";
import { getTodayMoodEntry, saveMoodEntry } from "@/lib/storage";
import { MoodEntry, MoodType } from "@/types";
import { Check, CheckCircle2, Clock, Sparkles, MessageSquareHeart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PulseCheckProps {
  onMoodSaved?: (entry: MoodEntry) => void;
  onNavigateToCompanion?: () => void;
}

export function PulseCheck({ onMoodSaved, onNavigateToCompanion }: PulseCheckProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState<string>("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [todayDateFormatted, setTodayDateFormatted] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load today's mood entry on mount
  useEffect(() => {
    async function loadTodayMood() {
      setTodayDateFormatted(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );

      try {
        setIsLoading(true);
        const entry = await getTodayMoodEntry();
        if (entry) {
          setTodayEntry(entry);
          setSelectedMood(entry.mood);
          if (entry.note) setNote(entry.note);
        }
      } catch (err) {
        console.error("Failed to load today's mood entry:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTodayMood();
  }, []);

  const handleSaveCheckIn = async () => {
    if (!selectedMood) {
      setFeedbackMsg({
        type: "error",
        text: "Please select an emoji that matches how you feel today.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const result = await saveMoodEntry({
        mood: selectedMood,
        note: note.trim() || undefined,
      });

      if (result.success && result.entry) {
        const isUpdate = Boolean(todayEntry);
        setTodayEntry(result.entry);
        setFeedbackMsg({
          type: "success",
          text: isUpdate
            ? "Your mood for today has been updated."
            : "Thank you for checking in with yourself. Your mood is saved for today.",
        });
        if (onMoodSaved) {
          onMoodSaved(result.entry);
        }
      } else {
        setFeedbackMsg({
          type: "error",
          text: result.error || "Could not save your check-in. Please try again.",
        });
      }
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "An unexpected error occurred while saving your check-in.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-medium">Checking in with your day...</p>
      </div>
    );
  }

  const selectedDetails = selectedMood ? getMoodDetails(selectedMood) : null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header card */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide">
          <Clock className="h-3.5 w-3.5" />
          <span>{todayDateFormatted}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          How are you feeling today?
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
          Take a gentle moment to notice your state of mind. There are no right or wrong answers.
        </p>

        {todayEntry && (
          <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              You recorded today as{" "}
              <strong>{getMoodDetails(todayEntry.mood).label}</strong>. You can update it below whenever you wish.
            </span>
          </div>
        )}
      </div>

      {/* 5 Emojis with clear text labels */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2.5 mb-6" role="radiogroup" aria-label="Select today's mood">
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selectedMood === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setSelectedMood(option.value);
                setFeedbackMsg(null);
              }}
              className={`group flex sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-2 p-3 sm:p-4 rounded-2xl border text-left sm:text-center transition-all ${
                isSelected
                  ? `${option.activeBgClass} ${option.activeBorderClass} shadow-sm scale-102`
                  : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/50"
              }`}
            >
              <span className="text-3xl sm:text-4xl transition-transform group-hover:scale-110">
                {option.emoji}
              </span>
              <div className="space-y-0.5">
                <span className="block text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {option.label}
                </span>
                <span className="block sm:hidden text-[11px] text-stone-500 dark:text-stone-400">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Mood Insight Bar */}
      {selectedDetails && (
        <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/50 mb-6 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Selected: <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedDetails.label}</span> — {selectedDetails.description}
          </p>
        </div>
      )}

      {/* Optional Note Card */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-xs mb-6 space-y-3">
        <label
          htmlFor="pulse-note"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400"
        >
          Add a reflection note (Optional)
        </label>
        <textarea
          id="pulse-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What contributed to how you feel? E.g., got a good night's rest, busy project deadline, peaceful walk..."
          maxLength={500}
          className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 dark:placeholder:text-stone-500 transition-colors"
        />
        <div className="flex justify-between text-[11px] text-stone-400">
          <span>Private and saved securely</span>
          <span>{note.length} / 500</span>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div
          role="alert"
          className={`p-4 rounded-2xl mb-6 text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <Check className="h-4 w-4 shrink-0 text-emerald-700" />
          ) : (
            <Sparkles className="h-4 w-4 shrink-0 text-rose-700" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Confirmation Button & Companion CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleSaveCheckIn}
          disabled={!selectedMood || isSubmitting}
          className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : todayEntry ? (
            <span>Update Today&apos;s Mood</span>
          ) : (
            <span>Save Today&apos;s Mood</span>
          )}
        </button>

        {onNavigateToCompanion && (
          <button
            type="button"
            onClick={onNavigateToCompanion}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 text-sm font-medium transition-colors"
          >
            <MessageSquareHeart className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>Talk to Companion</span>
          </button>
        )}
      </div>
    </section>
  );
}
