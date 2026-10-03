"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { AlertCircle, TrendingDown, ArrowRight, ZapOff } from "lucide-react";

export function ProblemSection() {
  const { t } = useLanguage();

  return (
    <section id="overview" className="py-24 lg:py-32 relative bg-[#FAF8F5]">
      <Container>
        {/* Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.problem.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.problem.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.problem.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.problem.description}
          </p>
        </div>

        {/* 3 Calm Steps - The Structural Gap Domino Effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {t.problem.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.07)] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-bold text-[#8A92A2] tracking-wider">
                    STAGE {step.step}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#435278] border border-[rgba(31,36,48,0.06)]">
                    {step.impact}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F2430] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#586071] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < 2 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] items-center justify-center text-[#435278]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Unifying Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#EEF2F7]/70 border border-[#D5DFEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#FFFFFF] border border-[#CBD8E6] flex items-center justify-center text-[#435278] shadow-xs shrink-0">
              <ZapOff className="w-5 h-5 text-[#435278]" />
            </div>
            <p className="text-sm sm:text-base font-medium text-[#1F2430] leading-relaxed">
              {t.problem.callout}
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
