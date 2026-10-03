"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import {
  ShieldAlert,
  TrendingDown,
  Layers,
  Zap,
  Clock,
  CheckCircle2,
  Cpu,
  Activity,
  ArrowRight,
} from "lucide-react";

export function TwoEnginesSection() {
  const { t } = useLanguage();
  const [activeEngine, setActiveEngine] = useState<"fraud" | "loan">("fraud");

  return (
    <section id="platform" className="py-24 lg:py-32 relative bg-[#F7F5F0]/60">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.engines.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.engines.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.engines.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.engines.subhead}
          </p>
        </div>

        {/* Side-by-Side Dual Engine Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Engine 1 Card: Real-Time Fraud */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full bg-[#FAF8F5] text-[#435278] border border-[rgba(31,36,48,0.06)]">
                  {t.engines.engine1.tag}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#FCF5E9] text-[#D49D4A] border border-[#F3E0BE] tnum">
                  <Zap className="w-3.5 h-3.5" />
                  {t.engines.engine1.sla}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2430] mb-4">
                {t.engines.engine1.title}
              </h3>
              <p className="text-sm sm:text-base text-[#586071] leading-relaxed mb-8">
                {t.engines.engine1.desc}
              </p>

              <div className="space-y-3 pt-6 border-t border-[rgba(31,36,48,0.06)]">
                {t.engines.engine1.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[#1F2430]">
                    <CheckCircle2 className="w-4 h-4 text-[#8FB8A0] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[rgba(31,36,48,0.06)] flex items-center justify-between text-xs text-[#586071]">
              <span>Synchronous Gateway Pre-Check</span>
              <span className="font-mono text-[#435278] font-semibold">POST /payments/precheck</span>
            </div>
          </motion.div>

          {/* Engine 2 Card: Loan Default Early Warning */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full bg-[#FAF8F5] text-[#435278] border border-[rgba(31,36,48,0.06)]">
                  {t.engines.engine2.tag}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA] tnum">
                  <Clock className="w-3.5 h-3.5" />
                  {t.engines.engine2.sla}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2430] mb-4">
                {t.engines.engine2.title}
              </h3>
              <p className="text-sm sm:text-base text-[#586071] leading-relaxed mb-8">
                {t.engines.engine2.desc}
              </p>

              <div className="space-y-3 pt-6 border-t border-[rgba(31,36,48,0.06)]">
                {t.engines.engine2.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[#1F2430]">
                    <CheckCircle2 className="w-4 h-4 text-[#8FB8A0] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[rgba(31,36,48,0.06)] flex items-center justify-between text-xs text-[#586071]">
              <span>Event-Driven Restructuring</span>
              <span className="font-mono text-[#435278] font-semibold">GET /loans/watchlist</span>
            </div>
          </motion.div>
        </div>

        {/* Shared Foundation Bar: Explainability & Case Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] flex items-center justify-center text-[#435278] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold text-[#1F2430]">
                {t.engines.shared.title}
              </h4>
              <p className="text-sm text-[#586071] leading-relaxed mt-1 max-w-2xl">
                {t.engines.shared.desc}
              </p>
            </div>
          </div>

          <a
            href="#explainability"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2EFE8] border border-[rgba(31,36,48,0.08)] text-xs font-semibold text-[#1F2430] transition-colors"
          >
            <span>Inspect SHAP Vectors</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#435278]" />
          </a>
        </motion.div>
      </Container>
    </section>
  );
}
