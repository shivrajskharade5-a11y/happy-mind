/**
 * Happy Mind - Shared Types & Interfaces
 */

export type MoodType =
  | "very_difficult"
  | "difficult"
  | "neutral"
  | "good"
  | "very_good";

export interface MoodOption {
  value: MoodType;
  emoji: string;
  label: string;
  description: string;
  score: number; // 1 (very difficult) to 5 (very good)
  colorClass: string;
  activeBgClass: string;
  activeBorderClass: string;
  badgeBgClass: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string; // ISO format YYYY-MM-DD
  mood: MoodType;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isSafetyEscalated?: boolean;
}

export type SafetySeverity = "none" | "low" | "moderate" | "high" | "immediate";

export interface HelplineResource {
  id: string;
  country: string;
  countryCode: string;
  name: string;
  contact: string;
  altContact?: string;
  description: string;
  available: string;
  type: "call" | "text" | "web";
  url?: string;
}

export interface SafetyClassification {
  isCrisis: boolean;
  severity: SafetySeverity;
  reason?: string;
  detectedPhrases?: string[];
  safeResponse?: string;
  resources: HelplineResource[];
}

export interface UserSession {
  id: string;
  email?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface CompanionApiResponse {
  success: boolean;
  message?: string;
  safety?: SafetyClassification;
  provider?: "gemini" | "openai" | "compassionate-offline";
  configured: boolean;
  error?: string;
}
