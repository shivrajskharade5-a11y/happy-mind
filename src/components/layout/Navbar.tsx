"use client";

import { APP_CONFIG } from "@/config/app";
import { UserSession } from "@/types";
import { Sparkles, Wind, ShieldAlert, Lock, User, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  activeTab: "pulse" | "companion" | "reflection";
  onTabChange: (tab: "pulse" | "companion" | "reflection") => void;
  onOpenBreathing: () => void;
  onOpenCrisis: () => void;
  onOpenPrivacy: () => void;
  onOpenAuth: () => void;
  session: UserSession | null;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenBreathing,
  onOpenCrisis,
  onOpenPrivacy,
  onOpenAuth,
  session,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange("pulse")}
            className="flex items-center gap-2 text-left group focus-visible:rounded-lg p-1 -m-1"
            aria-label={`${APP_CONFIG.name} Home`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                {APP_CONFIG.name}
              </span>
              <span className="hidden sm:block text-xs font-medium text-emerald-800 dark:text-emerald-400">
                Emotional Wellness
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
          <button
            onClick={() => onTabChange("pulse")}
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === "pulse"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-800/50"
            }`}
          >
            Pulse Check
          </button>
          <button
            onClick={() => onTabChange("companion")}
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === "companion"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-800/50"
            }`}
          >
            Companion
          </button>
          <button
            onClick={() => onTabChange("reflection")}
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
              activeTab === "reflection"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-800/50"
            }`}
          >
            Reflection
          </button>
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
            title="Guided 1-minute breathing exercise"
          >
            <Wind className="h-4 w-4" />
            <span>Breathe</span>
          </button>
        </nav>

        {/* Action Controls & Crisis Support */}
        <div className="flex items-center gap-2">
          {/* Direct Crisis Help Trigger */}
          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 transition-colors"
            title="Immediate verified emergency helplines"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Crisis Help</span>
          </button>

          {/* Privacy & Account state */}
          <button
            onClick={onOpenPrivacy}
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
            title="Privacy, Storage & Data Control"
            aria-label="Privacy and data settings"
          >
            <Lock className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-200/60 hover:bg-stone-200 rounded-lg dark:text-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
            title={session?.isAnonymous ? "Anonymous private session" : "Account details"}
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {session?.isAnonymous ? "Private Mode" : session?.email?.split("@")[0] || "Account"}
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              onTabChange("pulse");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "pulse"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "text-stone-700 dark:text-stone-300"
            }`}
          >
            Pulse Check
          </button>
          <button
            onClick={() => {
              onTabChange("companion");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "companion"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "text-stone-700 dark:text-stone-300"
            }`}
          >
            AI Companion
          </button>
          <button
            onClick={() => {
              onTabChange("reflection");
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "reflection"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "text-stone-700 dark:text-stone-300"
            }`}
          >
            Monthly Reflection
          </button>
          <button
            onClick={() => {
              onOpenBreathing();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            <Wind className="h-4 w-4" />
            <span>Guided Breathing</span>
          </button>
        </div>
      )}
    </header>
  );
}
