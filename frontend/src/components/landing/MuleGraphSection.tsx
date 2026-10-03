"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { GitFork, AlertCircle, ShieldAlert, ArrowRight, Layers } from "lucide-react";

export function MuleGraphSection() {
  const { t } = useLanguage();
  const [activeHop, setActiveHop] = useState<number>(3);

  return (
    <section className="py-24 lg:py-32 relative bg-[#F7F5F0]/60">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {t.graph.eyebrow}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {t.graph.headline}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {t.graph.headlineItalic}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {t.graph.subhead}
          </p>
        </div>

        {/* Visual Multi-Hop Topology Canvas Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-md relative overflow-hidden">
          {/* Top Bar with Hop Boundary Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[rgba(31,36,48,0.06)] mb-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] flex items-center justify-center text-[#435278]">
                <GitFork className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1F2430]">
                  Laundering Sub-Graph: Cluster #402
                </h4>
                <span className="text-xs text-[#8A92A2]">
                  Central Aggregator Mule Account: ACCT-9912-PUNJAB
                </span>
              </div>
            </div>

            {/* Hop selector */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] text-xs font-mono">
              <span className="text-[#8A92A2] px-2 text-[11px]">Depth Limit:</span>
              {[2, 3, 4].map((hop) => (
                <button
                  key={hop}
                  type="button"
                  onClick={() => setActiveHop(hop)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeHop === hop
                      ? "bg-[#435278] text-white font-bold"
                      : "text-[#586071] hover:text-[#1F2430]"
                  }`}
                >
                  k = {hop}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Visual Network Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center py-6">
            {/* Column 1: Victims */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
              <span className="text-[11px] font-mono uppercase text-[#8A92A2] block">
                {t.graph.victimNode}
              </span>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(31,36,48,0.06)] text-xs font-medium text-[#1F2430]">
                  Victim #1 (₹45,000)
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(31,36,48,0.06)] text-xs font-medium text-[#1F2430]">
                  Victim #2 (₹85,000)
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[rgba(31,36,48,0.06)] text-xs font-medium text-[#1F2430]">
                  Victim #3 (₹30,000)
                </div>
              </div>
            </div>

            {/* Column 2: Layer 1 Mules */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
              <span className="text-[11px] font-mono uppercase text-[#8A92A2] block">
                {t.graph.muleNode}
              </span>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white border border-[#F3E0BE] text-xs font-medium text-[#D49D4A]">
                  Mule A (Pass-through)
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#F3E0BE] text-xs font-medium text-[#D49D4A]">
                  Mule B (Pass-through)
                </div>
              </div>
            </div>

            {/* Column 3: Aggregator Mule (High Alert) */}
            <div className="p-6 rounded-2xl bg-[#FBEFEF] border border-[#F3D2D2] text-center shadow-xs">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#D16D6D] px-2 py-0.5 rounded-full bg-white mb-2">
                <ShieldAlert className="w-3 h-3" />
                C_D+ = 0.082
              </span>
              <h5 className="font-serif text-lg font-bold text-[#1F2430]">
                {t.graph.aggregatorNode}
              </h5>
              <p className="text-xs text-[#586071] mt-1">
                PageRank PR = 0.024
              </p>
              <span className="text-[10px] font-mono text-[#D16D6D] font-bold mt-2 block">
                FLAGGED FOR SYSTEMIC BLOCK
              </span>
            </div>

            {/* Column 4: Cash-Out Endpoint */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)] text-center">
              <span className="text-[11px] font-mono uppercase text-[#8A92A2] block mb-2">
                {t.graph.cashoutNode}
              </span>
              <div className="p-3 rounded-xl bg-white border border-[rgba(31,36,48,0.06)] text-xs font-medium text-[#1F2430]">
                ATM Terminal #4401 (Ludhiana)
              </div>
              <p className="text-[11px] text-[#586071] mt-2">
                Structured withdrawals intercepted
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[rgba(31,36,48,0.06)] flex flex-wrap items-center justify-between text-xs text-[#586071]">
            <span>Graph Analytics Engine: NetworkX Directed MultiDiGraph</span>
            <span className="font-mono text-[#435278]">Complexity bounded to O(V + E)</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
