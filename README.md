# Happy Mind — Emotional Wellness Web Application

**Happy Mind** is a calm, supportive, privacy-first emotional-wellness companion built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

> [!IMPORTANT]
> **Medical Disclaimer**: Happy Mind is an emotional-wellness companion and not a medical product. It does not provide medical diagnoses, treatment, or psychotherapy. If you or someone you know is in crisis, having thoughts of self-harm, or in immediate danger, reach out to verified professional emergency services immediately.

---

## 🌟 The Three Core Pillars

1. **Pulse Check** — Record your daily mood with one of five emojis and text labels (*Very difficult*, *A little difficult*, *Neutral*, *Good*, *Very good*). Enforces a single daily check-in rule that can be updated anytime throughout the day.
2. **AI Companion** — Engage in short, empathetic, supportive conversations with a dedicated AI Companion. Never pretends to be human or a doctor, listens first, and gently suggests pauses. Integrates with a multi-layered safety escalation system.
3. **Monthly Reflection** — View your emotional states in an intuitive monthly calendar. Inspect past moods and read honest, non-diagnostic monthly summaries based strictly on your recorded entries.

### Optional Interventions:
- **1-Minute Breathing Space** — Guided box breathing (4s Inhale • 4s Hold • 4s Exhale • 4s Rest) with gentle expanding/contracting visuals, controls, and reduced-motion support.
- **Take a Calming Break** — Safe external link to a verified ambient relaxation playlist with clear departure warnings.

---

## 🛡️ Critical Safety Architecture

Happy Mind treats user safety separately from standard conversation generation:
- **Multi-Layered Safety Classifier (`src/lib/safety.ts`)**: Evaluates user messages before invoking any external LLM.
- **Hinglish & Direct/Indirect Detection**: Recognizes distress expressions in English and Hinglish (e.g., *"marne ka mann kar raha hai"*, *"zindagi khatam karni hai"*, *"can't go on anymore"*).
- **Negation & Context Awareness**: Differentiates between active suicidal intent and quoted/educational context (*"reading about suicide prevention"* vs active crisis).
- **Dedicated Crisis UI (`src/components/safety/CrisisSupportModal.tsx`)**: Directly opens a calm crisis screen providing verified 24/7 helplines:
  - **India**: Tele-MANAS (`14416` / `1800 891 4416`), Vandrevala Foundation (`9999 666 555`), KIRAN (`1800-599-0019`).
  - **United States & Canada**: 988 Suicide & Crisis Lifeline (`988`), Crisis Text Line (`Text HOME to 741741`).
  - **United Kingdom**: Samaritans (`116 123`).
  - **International**: Find A Helpline (`https://findahelpline.com`).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v20+ or v24+
- **npm** v10+

### 2. Installation
Clone or open this repository, then install dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the template configuration:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell: `Copy-Item .env.example .env.local`)*

Happy Mind runs out of the box in **Private Local Storage Mode** even without any API keys configured!
- To activate live AI conversational responses, add your Google Gemini key:
  ```env
  GEMINI_API_KEY=your_key_from_google_ai_studio
  ```
- To activate cloud synchronization, add your Supabase credentials:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite covering safety classification, Hinglish detection, negation rules, pulse check business logic, and calendar calculations:
```bash
npm test
```

Run code quality and ESLint verification:
```bash
npm run lint
```

Run production build check:
```bash
npm run build
```

---

## 🗄️ Database & Supabase Migrations

When connecting to Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261011_initial_schema.sql` from this repository.
4. Execute the SQL script. This creates:
   - `mood_entries` with a unique constraint on `(user_id, date)`.
   - `conversations` and `messages`.
   - **Row Level Security (RLS)** policies that strictly restrict users to reading and writing only their own records.
5. In your Supabase Dashboard under **Project Settings > API**, copy the `Project URL` and `anon public` key to `.env.local`.

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Set the Environment Variables:
   - `GEMINI_API_KEY` (or `OPENAI_API_KEY`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_TAKE_A_BREAK_URL` (optional)
4. Click **Deploy**. Vercel will automatically build and publish your application.

---

## ⚠️ Pre-Launch Safety & Legal Checklist

Before making this application available to the general public:
- [ ] **Professional Safety Review**: Have qualified mental-health clinicians review the system prompts, safety classification rules, and crisis copy.
- [ ] **Resource Verification**: Verify that crisis helpline numbers remain active and appropriate for your target audience's geographic jurisdiction.
- [ ] **Privacy & Terms**: Have legal counsel review the Privacy Policy and Terms of Service, particularly regarding health data privacy standards (GDPR, HIPAA, etc.).
- [ ] **RLS Verification**: Test database permissions using two test accounts to ensure no cross-account data leaks are possible.
