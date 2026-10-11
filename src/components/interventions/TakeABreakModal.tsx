"use client";

import { APP_CONFIG } from "@/config/app";
import { Headphones, ExternalLink, X, Music } from "lucide-react";

interface TakeABreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TakeABreakModal({ isOpen, onClose }: TakeABreakModalProps) {
  if (!isOpen) return null;

  const playlistUrl = APP_CONFIG.features.takeABreak.defaultPlaylistUrl;
  const playlistLabel = APP_CONFIG.features.takeABreak.label;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="break-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="break-modal-title"
                className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
              >
                Take a Calming Break
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Rest your eyes and unwind with music
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-4">
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/60 p-4 dark:bg-emerald-950/30 dark:border-emerald-900/40">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium text-sm mb-1">
              <Music className="h-4 w-4" />
              <span>{playlistLabel}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              We selected this peaceful ambient soundscape to help ease mental fatigue and encourage gentle breathing.
            </p>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Note:
            </span>{" "}
            Clicking below will open the playlist in a new browser tab. You will be leaving Happy Mind, but you can return anytime.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
          >
            Stay Here
          </button>

          <a
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-transform active:scale-95"
          >
            <span>Open Playlist</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
