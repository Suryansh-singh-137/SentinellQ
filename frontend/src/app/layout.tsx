import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SentinelIQ — Unified AI Risk & Default Prevention Platform",
  description:
    "Enterprise dual-risk intelligence engine uniting sub-200ms real-time digital fraud detection with proactive loan default early warning.",
  keywords: [
    "Fraud Detection",
    "Credit Risk",
    "UPI Security",
    "NPA Prevention",
    "SHAP Explainability",
    "Mule Ring Detection"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${devanagari.variable} antialiased scroll-smooth`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--ink-primary)] selection:bg-[#E2E8F0] selection:text-[#1F2430]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
