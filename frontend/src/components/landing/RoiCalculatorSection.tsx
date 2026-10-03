"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { Calculator, ShieldCheck, TrendingDown, ArrowRight } from "lucide-react";

export function RoiCalculatorSection() {
  const { t } = useLanguage();
  const [volumeCrores, setVolumeCrores] = useState<number>(100); // 100 Cr monthly
  const [loanBookCrores, setLoanBookCrores] = useState<number>(300); // 300 Cr loan book

  // Financial model estimates:
  // Baseline scam rate ~ 0.25% of volume; SentinelIQ stops ~ 92% of scam losses
  const monthlyScamPrevented = (volumeCrores * 10000000 * 0.0025 * 0.92) / 10000000;
  // Downstream NPA reduction: ~ 1.5% of loan book at risk, early warning prevents 68% of defaults
  const annualNpaSaved = (loanBookCrores * 10000000 * 0.015 * 0.68) / 10000000;
  const totalAnnualPreserved = monthlyScamPrevented * 12 + annualNpaSaved;

  return (
    <section className="py-24 lg:py-32 relative bg-[#F7F5F0]/60">
      <Container>
        <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-lg">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] mb-4">
              {t.calculator.eyebrow}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2430] mb-3">
              {t.calculator.headline}{" "}
              <em className="font-serif italic font-normal text-[#435278]">
                {t.calculator.headlineItalic}
              </em>
            </h2>
            <p className="text-sm sm:text-base text-[#586071]">
              {t.calculator.subhead}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Controls: Interactive Sliders (6 cols) */}
            <div className="lg:col-span-6 space-y-8">
              {/* Slider 1: Monthly Payment Volume */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#1F2430]">
                    {t.calculator.monthlyVolume}
                  </span>
                  <span className="font-mono text-base font-bold text-[#435278] tnum">
                    ₹{volumeCrores} Cr / month
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={volumeCrores}
                  onChange={(e) => setVolumeCrores(Number(e.target.value))}
                  className="w-full h-2 bg-[#F5F2EB] rounded-lg appearance-none cursor-pointer accent-[#435278]"
                />
                <div className="flex justify-between text-[11px] text-[#8A92A2] font-mono">
                  <span>₹10 Cr</span>
                  <span>₹500 Cr</span>
                  <span>₹1,000 Cr</span>
                </div>
              </div>

              {/* Slider 2: Active Loan Book */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#1F2430]">
                    {t.calculator.loanBook}
                  </span>
                  <span className="font-mono text-base font-bold text-[#435278] tnum">
                    ₹{loanBookCrores} Cr
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={2000}
                  step={20}
                  value={loanBookCrores}
                  onChange={(e) => setLoanBookCrores(Number(e.target.value))}
                  className="w-full h-2 bg-[#F5F2EB] rounded-lg appearance-none cursor-pointer accent-[#435278]"
                />
                <div className="flex justify-between text-[11px] text-[#8A92A2] font-mono">
                  <span>₹20 Cr</span>
                  <span>₹1,000 Cr</span>
                  <span>₹2,000 Cr</span>
                </div>
              </div>
            </div>

            {/* Right Output: Impact Cards (6 cols) */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)]">
                <div>
                  <span className="text-xs text-[#586071] block">
                    {t.calculator.preventedFraud}
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#1F2430] tnum mt-0.5 block">
                    ₹{monthlyScamPrevented.toFixed(2)} Cr
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#EBF3EE] text-[#729E85]">
                  Sub-200ms Interception
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)]">
                <div>
                  <span className="text-xs text-[#586071] block">
                    {t.calculator.savedNpa}
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#1F2430] tnum mt-0.5 block">
                    ₹{annualNpaSaved.toFixed(2)} Cr
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FCF5E9] text-[#D49D4A]">
                  -68% NPA Defaults
                </span>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-[#8A92A2] uppercase tracking-wider block">
                  {t.calculator.combinedSavings}
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#435278] tnum mt-1 block">
                  ₹{totalAnnualPreserved.toFixed(2)} Cr / year
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
