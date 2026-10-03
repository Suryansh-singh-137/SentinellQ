"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { RotateCw, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from "lucide-react";

export function SelfLearningLoopSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 lg:py-32 relative bg-[#FAF8F5]">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.governance.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.governance.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.governance.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.governance.subhead}
          </p>
        </div>

        {/* 4 Loop Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.governance.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="h-8 w-8 rounded-full bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] flex items-center justify-center font-mono text-xs font-bold text-[#435278]">
                    {idx + 1}
                  </span>
                  <RotateCw className="w-4 h-4 text-[#8A92A2]" />
                </div>

                <h4 className="font-serif text-lg font-bold text-[#1F2430] mb-2">
                  {step.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#586071] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(31,36,48,0.06)] text-[11px] font-mono text-[#8A92A2]">
                {idx === 0
                  ? "Label: Confirmed Ground Truth"
                  : idx === 1
                  ? "Mode: Shadow Parallel"
                  : idx === 2
                  ? "Threshold: PSI < 0.25"
                  : "Gate: PR-AUC Superiority"}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
