"use client";

import { APP_CONFIG } from "@/config/app";
import { Shield, Heart } from "lucide-react";

interface FooterProps {
  onOpenCrisis: () => void;
  onOpenPrivacy: () => void;
}

export function Footer({ onOpenCrisis, onOpenPrivacy }: FooterProps) {
  return (
    <footer className="w-full border-t border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 py-8 px-4 sm:px-6 transition-colors mt-auto">
      <div className="mx-auto max-w-6xl">
        {/* Medical & Clinical Disclaimer Box */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5 dark:border-amber-900/50 dark:bg-amber-950/20 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-0.5">
                Medical & Wellness Disclaimer
              </span>
              {APP_CONFIG.disclaimer}
            </div>
          </div>
        </div>

        {/* Footer Navigation & Brand */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {APP_CONFIG.name}
            </span>
            <span>•</span>
            <span>Version {APP_CONFIG.version}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with care <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline" />
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={onOpenCrisis}
              className="hover:text-rose-600 dark:hover:text-rose-400 font-medium underline underline-offset-4 transition-colors"
            >
              Verified Crisis Helplines
            </button>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-stone-900 dark:hover:text-stone-100 font-medium underline underline-offset-4 transition-colors"
            >
              Privacy & Data Control
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
