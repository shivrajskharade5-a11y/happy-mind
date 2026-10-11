"use client";

import { APP_CONFIG } from "@/config/app";
import { purgeAllUserData } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Lock, Trash2, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataPurged: () => void;
}

export function PrivacyModal({
  isOpen,
  onClose,
  onDataPurged,
}: PrivacyModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const hasSupabase = isSupabaseConfigured();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await purgeAllUserData();
      onDataPurged();
      setConfirmDelete(false);
      onClose();
    } catch (e) {
      console.error("Purge error:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-2xl transition-all my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="privacy-modal-title"
                className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
              >
                Privacy & Data Storage
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Transparent information handling in {APP_CONFIG.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Close privacy dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 dark:bg-stone-800/40 dark:border-stone-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>What We Store</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>
                <strong>Daily Mood Entries:</strong> Date (YYYY-MM-DD), selected mood emoji rating (1-5), and any optional reflection note you write.
              </li>
              <li>
                <strong>Companion Chat History:</strong> Recent conversation messages for conversational continuity in your session.
              </li>
              <li>
                <strong>Storage Location:</strong>{" "}
                {hasSupabase
                  ? "Stored in private Supabase PostgreSQL database protected by Row Level Security (RLS)."
                  : "Stored locally on your device in Private Browser Storage (zero external database connection)."}
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 dark:bg-amber-950/30 dark:border-amber-900/40">
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              Data Minimization Commitment
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
              We never collect your phone contacts, location coordinates, or advertising IDs. Your emotional data is yours alone.
            </p>
          </div>

          {/* Purge section */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-950 dark:bg-rose-950/20">
            <div className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-300 text-xs sm:text-sm mb-1">
              <Trash2 className="h-4 w-4" />
              <span>Erase All Data</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
              Permanently delete all your recorded moods, notes, and companion conversations.
            </p>

            {confirmDelete ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs"
                >
                  {isDeleting ? "Erasing..." : "Yes, Permanently Erase Everything"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-stone-800 dark:border-rose-900 dark:text-rose-300 text-xs font-medium transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All Stored Entries</span>
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-stone-800 text-white hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
