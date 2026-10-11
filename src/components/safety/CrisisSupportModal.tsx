"use client";

import { APP_CONFIG } from "@/config/app";
import { HelplineResource } from "@/types";
import { Phone, MessageSquare, Globe, X, HeartHandshake, ShieldCheck, ExternalLink } from "lucide-react";
import { useState } from "react";

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function CrisisSupportModal({
  isOpen,
  onClose,
  reason,
}: CrisisSupportModalProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");

  if (!isOpen) return null;

  const helplines: readonly HelplineResource[] = APP_CONFIG.crisisDirectory;
  const filtered =
    selectedCountry === "ALL"
      ? helplines
      : helplines.filter(
          (h) => h.countryCode === selectedCountry || h.countryCode === "GLOBAL"
        );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-950 p-6 sm:p-8 shadow-2xl transition-all my-8">
        {/* Header with gentle compassionate tone */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="crisis-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
              >
                You Are Not Alone
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Support is available right now. Please reach out to someone who can help.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close crisis support dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clear non-judgmental empathy message */}
        <div className="rounded-2xl bg-rose-50/70 border border-rose-200/60 p-4 sm:p-5 dark:bg-rose-950/30 dark:border-rose-900/40 mb-6">
          {reason && (
            <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold mb-2">
              Note: {reason}
            </p>
          )}
          <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium mb-2">
            Happy Mind is an automated wellness companion and cannot provide emergency medical care or personal crisis intervention.
          </p>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            If you are in danger, having thoughts of self-harm, or feeling overwhelmed, please connect with one of these verified, free, confidential helplines staffed by compassionate human counselors.
          </p>
        </div>

        {/* Country filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 text-xs">
          <button
            onClick={() => setSelectedCountry("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCountry === "ALL"
                ? "bg-rose-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => setSelectedCountry("IN")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCountry === "IN"
                ? "bg-rose-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            India
          </button>
          <button
            onClick={() => setSelectedCountry("US")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCountry === "US"
                ? "bg-rose-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            US & Canada
          </button>
          <button
            onClick={() => setSelectedCountry("UK")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCountry === "UK"
                ? "bg-rose-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            }`}
          >
            UK
          </button>
        </div>

        {/* Verified Helpline cards */}
        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200">
                    {item.country}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {item.available}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {item.description}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0">
                {item.type === "call" ? (
                  <a
                    href={`tel:${item.contact.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-transform active:scale-95"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call {item.contact}</span>
                  </a>
                ) : item.type === "text" ? (
                  <a
                    href={`sms:${item.contact.replace(/[^\d]/g, "")}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold text-sm shadow-sm transition-transform active:scale-95"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{item.contact}</span>
                  </a>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold text-sm shadow-sm transition-transform active:scale-95"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Site</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified 24/7 confidential helplines</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
          >
            I am safe / Return to app
          </button>
        </div>
      </div>
    </div>
  );
}
