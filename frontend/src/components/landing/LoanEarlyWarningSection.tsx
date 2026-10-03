"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { TrendingDown, ShieldCheck, AlertTriangle, ShieldAlert, Clock, ArrowRight } from "lucide-react";

export function LoanEarlyWarningSection() {
  const { t } = useLanguage();
  const [activeStageIdx, setActiveStageIdx] = useState(1); // default Watch stage

  return (
    <section id="credit" className="py-24 lg:py-32 relative bg-[#FAF8F5]">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.credit.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.credit.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.credit.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.credit.subhead}
          </p>
        </div>

        {/* 4 Stages Stepper Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {t.credit.stages.map((stage, idx) => {
            const isHealthy = idx === 0;
            const isWatch = idx === 1;
            const isStressed = idx === 2;
            const isDefault = idx === 3;
            const isSelected = activeStageIdx === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                onClick={() => setActiveStageIdx(idx)}
                className={`p-6 rounded-3xl bg-[#FFFFFF] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isHealthy
                      ? "border-[#8FB8A0] ring-2 ring-[#8FB8A0]/20 shadow-md"
                      : isWatch
                      ? "border-[#E8B86B] ring-2 ring-[#E8B86B]/20 shadow-md"
                      : isStressed
                      ? "border-[#E8B86B] ring-2 ring-[#E8B86B]/30 shadow-md"
                      : "border-[#E58F8F] ring-2 ring-[#E58F8F]/20 shadow-md"
                    : "border-[rgba(31,36,48,0.08)] shadow-xs hover:border-[rgba(31,36,48,0.18)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isHealthy
                          ? "bg-[#EBF3EE] text-[#729E85]"
                          : isWatch
                          ? "bg-[#FCF5E9] text-[#D49D4A]"
                          : isStressed
                          ? "bg-[#FCF5E9] text-[#D49D4A]"
                          : "bg-[#FBEFEF] text-[#D16D6D]"
                      }`}
                    >
                      Score {stage.range}
                    </span>
                    <span className="text-xs text-[#8A92A2] font-mono">
                      Stage {idx + 1}
                    </span>
                  </div>

                  <h4 className="font-serif text-xl font-bold text-[#1F2430] mb-2">
                    {stage.name}
                  </h4>
                  <p className="text-xs text-[#586071] leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[rgba(31,36,48,0.06)] text-[11px] font-medium text-[#435278] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#435278]" />
                  <span>
                    {isHealthy
                      ? "Standard Monitor"
                      : isWatch
                      ? "Soft Nudge Sent"
                      : isStressed
                      ? "Restructure Offer"
                      : "Legal / Recovery"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quantitative Metrics Detail Box */}
        <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xs font-mono text-[#8A92A2] uppercase tracking-wider block mb-1">
              EMI-TO-INCOME (R_EMI)
            </span>
            <span className="font-serif text-3xl font-bold text-[#1F2430]">
              46.8%
            </span>
            <p className="text-xs text-[#586071] mt-1.5 leading-relaxed">
              Triggers warning when total monthly debt obligations exceed 40% of verified income.
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-[#8A92A2] uppercase tracking-wider block mb-1">
              INCOME SHOCK VELOCITY (ΔI)
            </span>
            <span className="font-serif text-3xl font-bold text-[#D49D4A]">
              -24.5%
            </span>
            <p className="text-xs text-[#586071] mt-1.5 leading-relaxed">
              Detects missed salary credits and month-over-month deposit reductions.
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-[#8A92A2] uppercase tracking-wider block mb-1">
              LIQUID RUNWAY ESTIMATE
            </span>
            <span className="font-serif text-3xl font-bold text-[#D16D6D]">
              1.1 Months
            </span>
            <p className="text-xs text-[#586071] mt-1.5 leading-relaxed">
              Calculates remaining operational cash buffer factoring post-fraud liquidity depletion.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
