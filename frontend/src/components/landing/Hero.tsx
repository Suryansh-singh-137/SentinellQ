"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Smartphone,
  CreditCard,
  Layers
} from "lucide-react";

type RiskTier = "high" | "medium" | "low";

interface ScenarioData {
  tier: RiskTier;
  label: string;
  badgeLabel: string;
  fraudScore: number;
  decisionText: string;
  latencyMs: number;
  scamType: string;
  amount: string;
  orderId: string;
  payee: string;
  deviceInfo: string;
  reasons: string[];
}

const scenarios: Record<RiskTier, ScenarioData> = {
  high: {
    tier: "high",
    label: "High Risk Scam",
    badgeLabel: "INTERVENTION HOLD",
    fraudScore: 88.5,
    decisionText: "BLOCKED & FLAGGED",
    latencyMs: 142,
    scamType: "Impersonation Scam",
    amount: "₹45,000.00",
    orderId: "ORD_8941_UPI",
    payee: "Merchant #892 (QuickGold Deals)",
    deviceInfo: "New Hardware ID · First Seen 4m ago",
    reasons: [
      "New device fingerprint unrecognized (first seen 4m ago)",
      "Transaction amount 8.2x historical baseline",
      "Beneficiary account created < 10 mins prior"
    ]
  },
  medium: {
    tier: "medium",
    label: "Medium Step-Up",
    badgeLabel: "STEP-UP VERIFICATION",
    fraudScore: 54.2,
    decisionText: "OTP CHALLENGE ISSUED",
    latencyMs: 118,
    scamType: "Payment-Request Collect",
    amount: "₹18,500.00",
    orderId: "ORD_3309_COLLECT",
    payee: "Collect Pull: @unverified_agent",
    deviceInfo: "Recognized Device · Location Mismatch",
    reasons: [
      "Inbound collect request from unlinked entity",
      "Velocity spike: 3rd transfer within trailing hour",
      "Merchant category flagged with elevated return rate"
    ]
  },
  low: {
    tier: "low",
    label: "Low Risk Approved",
    badgeLabel: "AUTO-APPROVED",
    fraudScore: 12.0,
    decisionText: "SESSION AUTHORIZED",
    latencyMs: 94,
    scamType: "Legitimate Transaction",
    amount: "₹1,250.00",
    orderId: "ORD_1028_UPI",
    payee: "Zepto Hyperlocal Grocery",
    deviceInfo: "Verified Device · Home Geolocation",
    reasons: [
      "Trusted merchant MCC with 0 abuse reports",
      "Biometric signature and device baseline verified",
      "Transaction consistent with 12-month spending pattern"
    ]
  }
};

export function Hero() {
  const { t, lang } = useLanguage();
  const [activeTier, setActiveTier] = useState<RiskTier>("high");
  const data = scenarios[activeTier];

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Soft Ambient Pastel Blobs (Calm Luxury Depth) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Soft Lavender / Periwinkle Blob */}
        <div className="absolute -top-36 left-1/4 h-[520px] w-[520px] rounded-full ambient-blob-1 blur-3xl opacity-70" />
        {/* Soft Sage Blob */}
        <div className="absolute top-1/3 -right-24 h-[480px] w-[480px] rounded-full ambient-blob-2 blur-3xl opacity-60" />
        {/* Soft Warm Apricot Blob */}
        <div className="absolute -bottom-24 left-10 h-[440px] w-[440px] rounded-full ambient-blob-3 blur-3xl opacity-50" />
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline, Narrative & CTAs (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs mb-6">
              <span className="h-2 w-2 rounded-full bg-[#8FB8A0] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278]">
                {t.hero.eyebrow}
              </span>
            </div>

            {/* Elegant Serif Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] leading-[1.08] tracking-[-0.025em] text-[#1F2430] mb-6">
              {t.hero.headlineLead}{" "}
              <span className="block mt-1 sm:mt-2">
                {t.hero.headlineFollow}{" "}
                <em className="font-serif italic font-normal text-[#435278]">
                  {t.hero.headlineItalic}
                </em>
              </span>
            </h1>

            {/* Calm, Reassuring Subhead */}
            <p className="text-base sm:text-lg lg:text-[19px] leading-[1.65] text-[#586071] max-w-[620px] mb-8 font-sans">
              {t.hero.subhead}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12 w-full sm:w-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#435278] hover:bg-[#344161] text-[#FFFFFF] text-[15px] font-medium shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4 opacity-90" />
              </a>

              <a
                href="#sandbox"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#FFFFFF] hover:bg-[#FDFCFB] border border-[rgba(31,36,48,0.12)] text-[#1F2430] text-[15px] font-medium shadow-xs transition-all duration-200 hover:border-[rgba(31,36,48,0.22)]"
              >
                <span>{t.hero.ctaSecondary}</span>
              </a>
            </div>

            {/* Trust Metrics Pill Strip */}
            <div className="w-full pt-6 border-t border-[rgba(31,36,48,0.07)] flex flex-wrap items-center justify-between sm:justify-start sm:gap-10 text-left">
              {t.hero.metrics.map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-mono text-xl sm:text-2xl font-semibold tracking-tight text-[#1F2430] tnum">
                    {item.value}
                  </span>
                  <span className="text-xs uppercase tracking-[0.08em] text-[#586071] font-medium mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Floating Glass Pre-Check Card (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Interactive Scenario Switcher Bar */}
            <div className="flex items-center justify-between gap-1.5 p-1 mb-3 rounded-full bg-[#FFFFFF]/90 border border-[rgba(31,36,48,0.08)] shadow-xs text-xs font-medium">
              <span className="text-[11px] font-medium text-[#586071] pl-2 hidden sm:inline">
                {t.hero.precheckCard.toggleSim}
              </span>
              <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                {(["high", "medium", "low"] as RiskTier[]).map((tier) => {
                  const isCurrent = activeTier === tier;
                  const label =
                    tier === "high"
                      ? "High Risk"
                      : tier === "medium"
                      ? "Medium Step-Up"
                      : "Low Risk";
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setActiveTier(tier)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isCurrent
                          ? tier === "high"
                            ? "bg-[#FBEFEF] text-[#D16D6D] border border-[#F3D2D2] shadow-xs"
                            : tier === "medium"
                            ? "bg-[#FCF5E9] text-[#D49D4A] border border-[#F3E0BE] shadow-xs"
                            : "bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA] shadow-xs"
                          : "text-[#586071] hover:text-[#1F2430]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floating Glass Pre-Check Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-7 transition-all duration-300 relative overflow-hidden">
              {/* Header: Live Pre-Check Status & Latency Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        activeTier === "high"
                          ? "bg-[#E58F8F]"
                          : activeTier === "medium"
                          ? "bg-[#E8B86B]"
                          : "bg-[#8FB8A0]"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        activeTier === "high"
                          ? "bg-[#D16D6D]"
                          : activeTier === "medium"
                          ? "bg-[#D49D4A]"
                          : "bg-[#729E85]"
                      }`}
                    />
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#1F2430]">
                    {t.hero.precheckCard.liveBadge}
                  </span>
                </div>

                {/* Sub-200ms Verified Latency Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-mono text-[#435278] tnum shadow-xs">
                  <Zap className="w-3 h-3 text-[#E8B86B]" />
                  <span>{data.latencyMs}ms SLA</span>
                </div>
              </div>

              {/* Transaction Telemetry Brief */}
              <div className="py-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#586071] block font-mono">
                      {data.orderId} · {t.hero.precheckCard.channel}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2430] tnum mt-0.5">
                      {data.amount}
                    </h3>
                  </div>

                  {/* Decision Chip */}
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-[0.04em] uppercase border flex items-center gap-1.5 ${
                      activeTier === "high"
                        ? "bg-[#FBEFEF] text-[#D16D6D] border-[#F3D2D2]"
                        : activeTier === "medium"
                        ? "bg-[#FCF5E9] text-[#D49D4A] border-[#F3E0BE]"
                        : "bg-[#EBF3EE] text-[#729E85] border-[#D1E5DA]"
                    }`}
                  >
                    {activeTier === "high" ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : activeTier === "medium" ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{data.badgeLabel}</span>
                  </div>
                </div>

                {/* Entity Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FFFFFF]/80 rounded-2xl p-3 border border-[rgba(31,36,48,0.05)]">
                  <div>
                    <span className="text-[#8A92A2] block text-[11px]">Beneficiary / Payee</span>
                    <span className="font-medium text-[#1F2430] truncate block">
                      {data.payee}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A92A2] block text-[11px]">Device State</span>
                    <span className="font-medium text-[#1F2430] truncate block">
                      {data.deviceInfo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Scoring Arc / Meter */}
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.06)] shadow-xs mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#435278]" />
                    <span className="text-xs font-semibold text-[#1F2430] uppercase tracking-[0.06em]">
                      Dynamic Fraud Score
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#1F2430] tnum">
                    {data.fraudScore} / 100
                  </span>
                </div>

                {/* Horizontal Graduated Risk Bar */}
                <div className="relative h-2.5 w-full rounded-full bg-[#F5F2EB] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      activeTier === "high"
                        ? "bg-[#D16D6D]"
                        : activeTier === "medium"
                        ? "bg-[#E8B86B]"
                        : "bg-[#8FB8A0]"
                    }`}
                    style={{ width: `${data.fraudScore}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#8A92A2] font-mono mt-1.5">
                  <span>0 (Safe)</span>
                  <span>40 (Step-Up)</span>
                  <span>70+ (Hold)</span>
                </div>
              </div>

              {/* Explainable Reason Codes (SHAP Features translated to plain English) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#586071]">
                    Explainable AI Attributions (SHAP)
                  </span>
                  <span className="text-[10px] font-mono text-[#729E85] font-medium">
                    {t.hero.precheckCard.rbiCompliant}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {data.reasons.map((reason, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-xs text-[#1F2430] bg-[#FAF8F5]/90 rounded-xl px-3 py-2 border border-[rgba(31,36,48,0.05)]"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                          activeTier === "high"
                            ? "bg-[#D16D6D]"
                            : activeTier === "medium"
                            ? "bg-[#D49D4A]"
                            : "bg-[#729E85]"
                        }`}
                      />
                      <span className="leading-snug">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
