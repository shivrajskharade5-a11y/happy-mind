import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_CONFIG } from "@/config/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Emotional Wellness & Daily Check-In`,
  description: APP_CONFIG.description,
  keywords: [
    "Happy Mind",
    "emotional wellness",
    "mood tracker",
    "AI companion",
    "reflection",
    "breathing exercise",
  ],
  authors: [{ name: APP_CONFIG.name }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBFBF9] dark:bg-[#111418] text-[#1E242B] dark:text-[#F0F2F5]">
        {children}
      </body>
    </html>
  );
}
