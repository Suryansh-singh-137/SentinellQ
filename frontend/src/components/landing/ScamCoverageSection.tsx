"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import {
  PhoneCall,
  Globe,
  RotateCcw,
  TrendingUp,
  GitFork,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const scamIcons = {
  impersonation: PhoneCall,
  phishing: Globe,
  fake_refund: RotateCcw,
  investment: TrendingUp,
  mule: GitFork,
  collect: ArrowDownLeft,
};

export function ScamCoverageSection() {
  const { t } = useLanguage();
  const [selectedScamId, setSelectedScamId] = useState("impersonation");

  return (
    <section id="scams" className="py-24 lg:py-32 relative bg-[#F7F5F0]/60">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.scams.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.scams.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.scams.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.scams.subhead}
          </p>
        </div>

        {/* 6 Scam Taxonomy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.scams.items.map((scam, idx) => {
            const IconComponent =
              scamIcons[scam.id as keyof typeof scamIcons] || PhoneCall;
            const isSelected = selectedScamId === scam.id;

            return (
              <motion.div
                key={scam.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setSelectedScamId(scam.id)}
                className={`p-7 rounded-3xl bg-[#FFFFFF] border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-[#435278] shadow-md ring-1 ring-[#435278]/20"
                    : "border-[rgba(31,36,48,0.08)] shadow-xs hover:border-[rgba(31,36,48,0.18)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-10 w-10 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] flex items-center justify-center text-[#435278]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A92A2] px-2 py-0.5 rounded-full bg-[#FAF8F5]">
                      Class {idx + 1}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#1F2430] mb-2">
                    {scam.name}
                  </h3>
                  <p className="text-sm text-[#586071] leading-relaxed mb-4">
                    {scam.summary}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)] text-xs space-y-1.5 mb-4">
                    <span className="font-semibold text-[#1F2430] block">
                      Technical Indicators:
                    </span>
                    <p className="text-[#586071] leading-relaxed">
                      {scam.indicators}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(31,36,48,0.06)] text-xs text-[#435278] font-medium flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8FB8A0]" />
                  <span>{scam.rule}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
