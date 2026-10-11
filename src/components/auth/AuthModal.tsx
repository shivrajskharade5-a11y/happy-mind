"use client";

import { APP_CONFIG } from "@/config/app";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { UserSession } from "@/types";
import { User, Mail, KeyRound, LogOut, X, Sparkles } from "lucide-react";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession | null;
  onSessionUpdated: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  session,
  onSessionUpdated,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMsg("Supabase is not configured yet. You are currently in local private mode.");
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Account created! Check your email to confirm, or you are signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Signed in successfully!");
      }
      onSessionUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    onSessionUpdated();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
              >
                {session && !session.isAnonymous ? "Your Account" : "Sign In or Join"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {APP_CONFIG.name} User Profile & Cloud Sync
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

        {/* If user is already authenticated */}
        {session && !session.isAnonymous ? (
          <div className="space-y-4 my-4">
            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 dark:bg-stone-800/50 dark:border-stone-700">
              <span className="text-xs text-stone-400 block mb-0.5">Signed in as</span>
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {session.email}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40 text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="my-4">
            {!isConfigured ? (
              <div className="rounded-2xl bg-stone-50 border border-stone-200/80 p-4 dark:bg-stone-800/40 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-2 mb-4">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Private Local Guest Mode Active</span>
                </div>
                <p>
                  Happy Mind is fully functional right now in private local mode. Your mood check-ins and companion messages are stored privately in your browser.
                </p>
                <p className="text-[11px] text-stone-400">
                  To enable cross-device cloud sync, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your environment variables.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800 mb-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                      mode === "signin"
                        ? "bg-white text-stone-900 shadow-xs dark:bg-stone-700 dark:text-white"
                        : "text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                      mode === "signup"
                        ? "bg-white text-stone-900 shadow-xs dark:bg-stone-700 dark:text-white"
                        : "text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                    {successMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 pl-9 text-sm text-stone-900 placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 pl-9 text-sm text-stone-900 placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                    />
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  {loading
                    ? "Processing..."
                    : mode === "signin"
                    ? "Sign In"
                    : "Create Private Account"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
