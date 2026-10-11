/**
 * Happy Mind - Unified Storage & Persistence Layer
 *
 * Supports both:
 * 1. Supabase PostgreSQL with Row Level Security (when credentials configured)
 * 2. Secure Local Storage Private Mode (for immediate zero-config testing & offline privacy)
 *
 * Enforces strict business rules:
 * - Exactly one mood entry per user per day
 * - Update existing entry for the current day without duplicating
 * - Consistent local timezone ISO date strings (YYYY-MM-DD)
 */

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { ChatMessage, MoodEntry, MoodType, UserSession } from "@/types";

const LOCAL_STORAGE_KEYS = {
  MOODS: "happy_mind_mood_entries_v1",
  MESSAGES: "happy_mind_chat_messages_v1",
  USER: "happy_mind_user_session_v1",
};

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 * Avoids UTC timezone shift bugs where late evening check-ins shift to tomorrow.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Safe local storage getter
 */
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe local storage setter
 */
function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
  }
}

/**
 * Retrieves current active user session or creates an anonymous private session.
 */
export async function getCurrentUserSession(): Promise<UserSession> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email,
          isAnonymous: false,
          createdAt: session.user.created_at,
        };
      }
    } catch (e) {
      console.warn("Supabase auth session fetch error:", e);
    }
  }

  // Fallback to anonymous local session
  let localUser = getLocalItem<UserSession | null>(
    LOCAL_STORAGE_KEYS.USER,
    null
  );
  if (!localUser) {
    localUser = {
      id: "guest-" + Math.random().toString(36).substring(2, 10),
      isAnonymous: true,
      createdAt: new Date().toISOString(),
    };
    setLocalItem(LOCAL_STORAGE_KEYS.USER, localUser);
  }
  return localUser;
}

/**
 * Fetches all saved mood entries for the current user.
 */
export async function getAllMoodEntries(): Promise<MoodEntry[]> {
  const user = await getCurrentUserSession();
  const supabase = getSupabaseClient();

  if (supabase && !user.isAnonymous) {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching mood entries from Supabase:", error);
      } else if (data) {
        return data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          date: item.date,
          mood: item.mood as MoodType,
          note: item.note ?? undefined,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (e) {
      console.error("Supabase request failed, falling back to local:", e);
    }
  }

  // Local storage mode
  const localList = getLocalItem<MoodEntry[]>(LOCAL_STORAGE_KEYS.MOODS, []);
  return localList.filter((m) => m.userId === user.id);
}

/**
 * Retrieves today's saved mood entry, if one exists.
 */
export async function getTodayMoodEntry(): Promise<MoodEntry | null> {
  const todayStr = getLocalDateString();
  const all = await getAllMoodEntries();
  return all.find((entry) => entry.date === todayStr) || null;
}

/**
 * Saves or updates a mood entry for a given date.
 * MVP Rule: Exactly ONE entry per day per user.
 * If an entry already exists for that date, it is updated.
 */
export async function saveMoodEntry(params: {
  mood: MoodType;
  note?: string;
  date?: string; // Optional, defaults to today
}): Promise<{ success: boolean; entry?: MoodEntry; error?: string }> {
  const user = await getCurrentUserSession();
  const dateStr = params.date || getLocalDateString();
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (supabase && !user.isAnonymous) {
    try {
      // Upsert into Supabase
      const { data, error } = await supabase
        .from("mood_entries")
        .upsert(
          {
            user_id: user.id,
            date: dateStr,
            mood: params.mood,
            note: params.note?.trim() || null,
            updated_at: now,
          },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();

      if (error) {
        console.error("Failed to upsert mood in Supabase:", error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        entry: {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          mood: data.mood as MoodType,
          note: data.note ?? undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Database error";
      return { success: false, error: errorMsg };
    }
  }

  // Local storage path
  try {
    const list = getLocalItem<MoodEntry[]>(LOCAL_STORAGE_KEYS.MOODS, []);
    const existingIndex = list.findIndex(
      (item) => item.userId === user.id && item.date === dateStr
    );

    let savedEntry: MoodEntry;

    if (existingIndex >= 0) {
      // Update existing entry for this date
      savedEntry = {
        ...list[existingIndex],
        mood: params.mood,
        note: params.note?.trim() || undefined,
        updatedAt: now,
      };
      list[existingIndex] = savedEntry;
    } else {
      // Create new entry
      savedEntry = {
        id: "mood-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        date: dateStr,
        mood: params.mood,
        note: params.note?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      list.unshift(savedEntry);
    }

    setLocalItem(LOCAL_STORAGE_KEYS.MOODS, list);
    return { success: true, entry: savedEntry };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save locally",
    };
  }
}

/**
 * Retrieves chat history for the user's companion conversation.
 */
export async function getChatMessages(): Promise<ChatMessage[]> {
  return getLocalItem<ChatMessage[]>(LOCAL_STORAGE_KEYS.MESSAGES, []);
}

/**
 * Saves a new chat message to history.
 */
export async function appendChatMessage(
  message: Omit<ChatMessage, "id" | "createdAt">
): Promise<ChatMessage> {
  const fullMessage: ChatMessage = {
    ...message,
    id: "msg-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };

  const list = getLocalItem<ChatMessage[]>(LOCAL_STORAGE_KEYS.MESSAGES, []);
  list.push(fullMessage);
  // Keep up to 50 recent messages to prevent storage bloat
  const trimmed = list.slice(-50);
  setLocalItem(LOCAL_STORAGE_KEYS.MESSAGES, trimmed);

  return fullMessage;
}

/**
 * Clears chat conversation history.
 */
export function clearChatHistory(): void {
  setLocalItem(LOCAL_STORAGE_KEYS.MESSAGES, []);
}

/**
 * Complete Data Deletion / Privacy Purge
 * Removes all local mood entries, chat messages, and session data.
 */
export async function purgeAllUserData(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.MOODS);
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.MESSAGES);
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }

  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const user = await getCurrentUserSession();
      if (!user.isAnonymous) {
        await supabase.from("mood_entries").delete().eq("user_id", user.id);
        await supabase.from("messages").delete().eq("user_id", user.id);
        await supabase.from("conversations").delete().eq("user_id", user.id);
      }
    } catch (e) {
      console.error("Error purging remote data:", e);
    }
  }
}
