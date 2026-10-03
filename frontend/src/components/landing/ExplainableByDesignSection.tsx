"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { Layers, CheckCircle2, ShieldCheck, Info, Sparkles } from "lucide-react";

export function ExplainableByDesignSection() {
  const { t } = useLanguage();

  return (
    <section id="explainability" className="py-24 lg:py-32 relative bg-[#FAF8F5]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Context & Narrative (5 cols) */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
              {t.explainability.eyebrow}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
              {t.explainability.headline}{" "}
              <em className="font-serif italic font-normal text-[#435278]">
                {t.explainability.headlineItalic}
              </em>
            </h2>
            <p className="text-base sm:text-lg text-[#586071] leading-relaxed mb-8">
              {t.explainability.subhead}
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.07)] shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8FB8A0] shrink-0 mt-0.5" />
                <p className="text-sm text-[#1F2430]">
                  <strong>RBI Compliance:</strong> Local Shapley feature attributions eliminate opaque machine learning predictions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.07)] shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8FB8A0] shrink-0 mt-0.5" />
                <p className="text-sm text-[#1F2430]">
                  <strong>Plain-English Translation:</strong> Raw numerical model weights are automatically converted to human-readable investigative reasons.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Mock Analyst SHAP Attribution Panel (7 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 p-7 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)] mb-6">
              <div>
                <span className="font-mono text-xs text-[#8A92A2] block">
                  {t.explainability.sampleTitle}
                </span>
                <h4 className="font-serif text-xl font-bold text-[#1F2430] mt-0.5">
                  {t.explainability.customer}
                </h4>
              </div>

              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA]">
                RBI Compliant
              </span>
            </div>

            {/* SHAP Waterfall Attribution Bars */}
            <div className="space-y-4">
              {t.explainability.reasons.map((item, idx) => {
                const isPositive = item.impact.startsWith("+");
                const val = parseFloat(item.impact);
                const barWidth = Math.min(Math.abs(val) * 180, 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1F2430]">
                        {item.feature}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isPositive ? "text-[#D16D6D]" : "text-[#729E85]"
                        } tnum`}
                      >
                        {item.impact} SHAP
                      </span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="h-2 w-full rounded-full bg-[#FAF8F5] overflow-hidden flex items-center">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isPositive ? "bg-[#E58F8F]" : "bg-[#8FB8A0]"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#586071]">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(31,36,48,0.06)] flex items-center justify-between text-xs text-[#8A92A2]">
              <span>Inference Pipeline: XGBoost v1.4 + TreeExplainer</span>
              <span className="font-mono text-[#435278]">Latency: 18ms</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
