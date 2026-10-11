"use client";

import { AuthModal } from "@/components/auth/AuthModal";
import { CompanionChat } from "@/components/companion/CompanionChat";
import { BreathingExercise } from "@/components/interventions/BreathingExercise";
import { TakeABreakModal } from "@/components/interventions/TakeABreakModal";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PrivacyModal } from "@/components/privacy/PrivacyModal";
import { PulseCheck } from "@/components/pulse-check/PulseCheck";
import { ReflectionCalendar } from "@/components/reflection/ReflectionCalendar";
import { CrisisSupportModal } from "@/components/safety/CrisisSupportModal";
import { APP_CONFIG } from "@/config/app";
import { getCurrentUserSession } from "@/lib/storage";
import { UserSession } from "@/types";
import { useEffect, useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pulse" | "companion" | "reflection">("pulse");
  const [session, setSession] = useState<UserSession | null>(null);

  // Modals state
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isTakeABreakOpen, setIsTakeABreakOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [crisisReason, setCrisisReason] = useState<string | undefined>(undefined);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Key to force refresh after data purge or mood change
  const [dataVersion, setDataVersion] = useState(0);

  const refreshSession = async () => {
    try {
      const u = await getCurrentUserSession();
      setSession(u);
    } catch (e) {
      console.error("Session refresh error:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCurrentUserSession().then((u) => {
      if (isMounted) setSession(u);
    }).catch((err) => {
      console.error("Session load error:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCrisis = (reason?: string) => {
    setCrisisReason(reason);
    setIsCrisisOpen(true);
  };

  const handleMoodSaved = () => {
    setDataVersion((v) => v + 1);
  };

  const handleDataPurged = () => {
    setDataVersion((v) => v + 1);
    refreshSession();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBF9] dark:bg-[#111418] text-[#1E242B] dark:text-[#F0F2F5] transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenCrisis={() => handleOpenCrisis()}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        session={session}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Onboarding Welcome Strip */}
        <section className="border-b border-stone-200/60 dark:border-stone-800/60 bg-gradient-to-r from-emerald-50/40 via-stone-50/40 to-teal-50/30 dark:from-emerald-950/10 dark:via-stone-900 dark:to-teal-950/10 py-3 px-4">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Welcome to {APP_CONFIG.name}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Three pillars for your day:
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] sm:text-xs">
              <button
                onClick={() => setActiveTab("pulse")}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  activeTab === "pulse"
                    ? "text-emerald-700 dark:text-emerald-400 font-bold"
                    : "hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <span>1. Pulse Check</span>
              </button>
              <button
                onClick={() => setActiveTab("companion")}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  activeTab === "companion"
                    ? "text-emerald-700 dark:text-emerald-400 font-bold"
                    : "hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <span>2. AI Companion</span>
              </button>
              <button
                onClick={() => setActiveTab("reflection")}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  activeTab === "reflection"
                    ? "text-emerald-700 dark:text-emerald-400 font-bold"
                    : "hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <span>3. Monthly Reflection</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Viewport */}
        {activeTab === "pulse" && (
          <PulseCheck
            key={`pulse-${dataVersion}`}
            onMoodSaved={handleMoodSaved}
            onNavigateToCompanion={() => setActiveTab("companion")}
          />
        )}

        {activeTab === "companion" && (
          <CompanionChat
            key={`companion-${dataVersion}`}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenTakeABreak={() => setIsTakeABreakOpen(true)}
            onOpenCrisis={handleOpenCrisis}
          />
        )}

        {activeTab === "reflection" && (
          <ReflectionCalendar
            key={`reflection-${dataVersion}`}
            onSelectTodayToUpdate={() => setActiveTab("pulse")}
          />
        )}
      </main>

      {/* Global Modals */}
      <BreathingExercise
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <TakeABreakModal
        isOpen={isTakeABreakOpen}
        onClose={() => setIsTakeABreakOpen(false)}
      />

      <CrisisSupportModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        reason={crisisReason}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onDataPurged={handleDataPurged}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        onSessionUpdated={refreshSession}
      />

      {/* Footer */}
      <Footer
        onOpenCrisis={() => handleOpenCrisis()}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />
    </div>
  );
}
