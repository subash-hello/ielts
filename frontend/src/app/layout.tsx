import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SilenceWarnings from "../components/SilenceWarnings";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IELTS AI — Master IELTS with Artificial Intelligence",
  description:
    "AI-powered IELTS preparation platform. Practice Speaking, Writing, Reading & Listening with real-time AI feedback, personalized study plans, and mock tests. Improve your IELTS band score today.",
  keywords: [
    "IELTS",
    "IELTS preparation",
    "AI tutor",
    "IELTS speaking",
    "IELTS writing",
    "IELTS reading",
    "IELTS listening",
    "band score",
    "mock test",
    "AI feedback",
  ],
  authors: [{ name: "IELTS AI" }],
  openGraph: {
    title: "IELTS AI — Master IELTS with Artificial Intelligence",
    description:
      "Practice all IELTS modules with AI-powered feedback. Get personalized study plans and improve your band score.",
    type: "website",
    locale: "en_US",
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
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <SilenceWarnings />
        <Toaster position="top-right" toastOptions={{ style: { background: '#0F0F11', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
        {children}
      </body>
    </html>
  );
}

