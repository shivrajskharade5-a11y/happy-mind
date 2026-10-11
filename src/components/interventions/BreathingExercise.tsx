"use client";

import { APP_CONFIG } from "@/config/app";
import { Wind, Play, Pause, RotateCcw, X, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPhase = "prepare" | "inhale" | "hold" | "exhale" | "rest" | "completed";

export function BreathingExercise({ isOpen, onClose }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<BreathingPhase>("prepare");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    APP_CONFIG.features.breathingExercise.defaultDurationSeconds
  );
  const [cycleSeconds, setCycleSeconds] = useState<number>(4);
  const [isActive, setIsActive] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer when modal closes
  useEffect(() => {
    if (!isOpen && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  // Main timer loop
  useEffect(() => {
    if (!isActive || phase === "prepare" || phase === "completed") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prevTotal) => {
        if (prevTotal <= 1) {
          setIsActive(false);
          setPhase("completed");
          return 0;
        }
        return prevTotal - 1;
      });

      setCycleSeconds((prevCycle) => {
        if (prevCycle <= 1) {
          // Advance phase
          setPhase((currentPhase) => {
            if (currentPhase === "inhale") return "hold";
            if (currentPhase === "hold") return "exhale";
            if (currentPhase === "exhale") return "rest";
            return "inhale";
          });
          return 4; // Reset to 4 seconds for next phase
        }
        return prevCycle - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase]);

  if (!isOpen) return null;

  const handleStart = () => {
    setPhase("inhale");
    setCycleSeconds(4);
    setIsActive(true);
  };

  const handlePauseResume = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("prepare");
    setSecondsRemaining(APP_CONFIG.features.breathingExercise.defaultDurationSeconds);
    setCycleSeconds(4);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Visual text and circle scale based on phase
  const getPhaseInstruction = () => {
    switch (phase) {
      case "prepare":
        return "Find a comfortable posture and relax your shoulders.";
      case "inhale":
        return "Inhale gently through your nose...";
      case "hold":
        return "Hold your breath softly...";
      case "exhale":
        return "Exhale slowly through your mouth...";
      case "rest":
        return "Pause and rest comfortably...";
      case "completed":
        return "You have completed your 1-minute breathing pause.";
    }
  };

  const getCircleScaleClass = () => {
    switch (phase) {
      case "inhale":
        return "scale-125 bg-emerald-200/60 border-emerald-400 dark:bg-emerald-950/80 dark:border-emerald-600";
      case "hold":
        return "scale-125 bg-teal-200/60 border-teal-400 dark:bg-teal-950/80 dark:border-teal-600";
      case "exhale":
        return "scale-85 bg-cyan-100/50 border-cyan-300 dark:bg-cyan-950/50 dark:border-cyan-700";
      case "rest":
      case "prepare":
        return "scale-90 bg-stone-100 border-stone-300 dark:bg-stone-800 dark:border-stone-700";
      case "completed":
        return "scale-105 bg-emerald-100 border-emerald-500 dark:bg-emerald-950/70";
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const remainingSecs = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${remainingSecs.toString().padStart(2, "0")}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breathing-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Wind className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="breathing-title"
                className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
              >
                1-Minute Breathing Space
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Box breathing pattern: 4s Inhale • 4s Hold • 4s Exhale • 4s Rest
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Exit breathing exercise"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Animation Arena */}
        <div className="my-8 flex flex-col items-center justify-center min-h-[220px]">
          <div
            className={`flex h-44 w-44 items-center justify-center rounded-full border-4 transition-all duration-[4000ms] ease-in-out shadow-inner ${getCircleScaleClass()}`}
          >
            <div className="text-center px-4">
              {phase === "completed" ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-1" />
                  <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Well Done
                  </span>
                </div>
              ) : phase === "prepare" ? (
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                  Ready
                </span>
              ) : (
                <>
                  <div className="text-lg font-bold capitalize text-stone-800 dark:text-stone-100">
                    {phase}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {cycleSeconds}s
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-sm font-medium text-stone-700 dark:text-stone-300 max-w-sm min-h-[40px] flex items-center justify-center">
            {getPhaseInstruction()}
          </p>

          <div className="mt-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
            {timeFormatted} remaining
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
          {phase === "prepare" ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-transform active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Begin 1-Minute Breath</span>
            </button>
          ) : phase === "completed" ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-transform active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Breathe Again</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-transform active:scale-95"
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 font-medium text-sm transition-colors"
                title="Restart exercise"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </>
          )}

          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-sm font-medium rounded-2xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            Exit
          </button>
        </div>

        {/* Disclaimer note */}
        <p className="mt-4 text-center text-[11px] text-stone-400 dark:text-stone-500">
          Gentle breathing is for relaxation only and does not diagnose or cure any medical condition.
        </p>
      </div>
    </div>
  );
}
