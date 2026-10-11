/**
 * Happy Mind - Central Application Configuration
 * All product naming, disclaimers, defaults, and helpline directories
 * are centralized here for maintainability.
 */

export const APP_CONFIG = {
  name: "Happy Mind",
  shortName: "HappyMind",
  tagline: "Your gentle space to pause, check in, and breathe.",
  description:
    "Happy Mind is a supportive, private emotional-wellness companion designed to help you recognize your feelings, have calming conversations, and reflect on your emotional journey.",
  version: "1.0.0",

  // Medical and clinical disclaimer - shown clearly throughout the app
  disclaimer:
    "Happy Mind is an emotional-wellness companion and not a medical product. It does not provide medical diagnoses, treatment, or psychotherapy. If you are experiencing a crisis, severe distress, or thoughts of self-harm, please reach out to trusted professionals or emergency services immediately.",

  // Features configuration
  features: {
    pulseCheck: {
      enabled: true,
      allowUpdateSameDay: true,
    },
    companion: {
      enabled: true,
      maxMessageLength: 1000,
      maxHistoryMessages: 10,
    },
    reflection: {
      enabled: true,
    },
    breathingExercise: {
      enabled: true,
      defaultDurationSeconds: 60,
      cycle: {
        inhale: 4,
        hold: 4,
        exhale: 4,
        rest: 4,
      },
    },
    takeABreak: {
      enabled: true,
      // Public verified peaceful listening link (Peaceful Lo-fi / Calm Ambient music on Spotify)
      defaultPlaylistUrl:
        process.env.NEXT_PUBLIC_TAKE_A_BREAK_URL ||
        "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
      label: "Peaceful Ambient Playlist (Spotify)",
    },
  },

  // Verified crisis helpline directory
  crisisDirectory: [
    {
      id: "in-telemanas",
      country: "India",
      countryCode: "IN",
      name: "Tele-MANAS (Ministry of Health)",
      contact: "14416",
      altContact: "1800 891 4416",
      description: "24/7 free, confidential mental health helpline run by the Government of India in 20+ languages.",
      available: "24 hours / 7 days",
      type: "call" as const,
      url: "https://telemanas.mohfw.gov.in",
    },
    {
      id: "in-vandrevala",
      country: "India",
      countryCode: "IN",
      name: "Vandrevala Foundation Helpline",
      contact: "9999 666 555",
      description: "Free 24/7 crisis intervention and emotional distress counselling across India.",
      available: "24 hours / 7 days",
      type: "call" as const,
      url: "https://www.vandrevalafoundation.com",
    },
    {
      id: "in-kiran",
      country: "India",
      countryCode: "IN",
      name: "KIRAN Helpline",
      contact: "1800-599-0019",
      description: "24/7 mental health rehabilitation helpline by the Ministry of Social Justice & Empowerment.",
      available: "24 hours / 7 days",
      type: "call" as const,
    },
    {
      id: "us-988",
      country: "United States & Canada",
      countryCode: "US",
      name: "988 Suicide & Crisis Lifeline",
      contact: "988",
      description: "Call or text 988 for free, confidential 24/7 support across the US and Canada.",
      available: "24 hours / 7 days",
      type: "call" as const,
      url: "https://988lifeline.org",
    },
    {
      id: "us-crisistext",
      country: "United States & Canada",
      countryCode: "US",
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "Free, 24/7 crisis support via SMS in the US and Canada.",
      available: "24 hours / 7 days",
      type: "text" as const,
      url: "https://www.crisistextline.org",
    },
    {
      id: "uk-samaritans",
      country: "United Kingdom",
      countryCode: "UK",
      name: "Samaritans UK",
      contact: "116 123",
      description: "Free 24/7 confidential listening service across the UK and ROI.",
      available: "24 hours / 7 days",
      type: "call" as const,
      url: "https://www.samaritans.org",
    },
    {
      id: "intl-findahelpline",
      country: "International (130+ Countries)",
      countryCode: "GLOBAL",
      name: "Find A Helpline (Global Directory)",
      contact: "Visit findahelpline.com",
      description: "Free, confidential directory of verified crisis lines in over 130 countries worldwide.",
      available: "24 hours / 7 days",
      type: "web" as const,
      url: "https://findahelpline.com",
    },
  ],
} as const;

export type AppConfig = typeof APP_CONFIG;
