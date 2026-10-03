"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Zap, Radio } from "lucide-react";

export function DecisionFlowSection() {
  const { t } = useLanguage();
  const [activeTierIdx, setActiveTierIdx] = useState(0);

  return (
    <section id="routing" className="py-24 lg:py-32 relative bg-[#FAF8F5]">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.routing.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.routing.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.routing.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.routing.subhead}
          </p>
        </div>

        {/* Dynamic 3-Tier Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.routing.tiers.map((tier, idx) => {
            const isSage = tier.color === "sage";
            const isAmber = tier.color === "amber";
            const isCoral = tier.color === "coral";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`p-8 rounded-3xl bg-[#FFFFFF] border transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${
                  isSage
                    ? "hover:border-[#8FB8A0] border-[rgba(31,36,48,0.08)] shadow-xs hover:shadow-md"
                    : isAmber
                    ? "hover:border-[#E8B86B] border-[rgba(31,36,48,0.08)] shadow-xs hover:shadow-md"
                    : "hover:border-[#E58F8F] border-[rgba(31,36,48,0.08)] shadow-xs hover:shadow-md"
                }`}
                onClick={() => setActiveTierIdx(idx)}
              >
                <div>
                  {/* Top Badge & Score Threshold */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                        isSage
                          ? "bg-[#EBF3EE] text-[#729E85] border-[#D1E5DA]"
                          : isAmber
                          ? "bg-[#FCF5E9] text-[#D49D4A] border-[#F3E0BE]"
                          : "bg-[#FBEFEF] text-[#D16D6D] border-[#F3D2D2]"
                      }`}
                    >
                      {tier.scoreRange}
                    </span>

                    <span className="text-[11px] font-mono text-[#8A92A2] font-medium">
                      {tier.handling}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#1F2430] mb-2">
                    {tier.tier}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    {isSage ? (
                      <CheckCircle2 className="w-4 h-4 text-[#729E85]" />
                    ) : isAmber ? (
                      <AlertTriangle className="w-4 h-4 text-[#D49D4A]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#D16D6D]" />
                    )}
                    <span className="text-sm font-semibold text-[#1F2430]">
                      {tier.action}
                    </span>
                  </div>

                  <p className="text-sm text-[#586071] leading-relaxed">
                    {tier.outcome}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[rgba(31,36,48,0.06)] flex items-center justify-between text-xs text-[#8A92A2]">
                  <span>Gateway Protocol</span>
                  <span className="font-mono text-[#1F2430]">
                    {isSage ? "ALLOW_SESSION" : isAmber ? "ENFORCE_OTP" : "BLOCK_AND_HOLD"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
