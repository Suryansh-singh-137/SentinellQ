"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { ArrowUpRight, Activity } from "lucide-react";

export function FinalCtaSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 lg:py-28 relative bg-[#FAF8F5]">
      <Container>
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-[#435278] to-[#2E3B59] text-white shadow-xl relative overflow-hidden text-center flex flex-col items-center">
          {/* Subtle geometric circles in background */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full border border-white/10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold tracking-[0.14em] uppercase text-white/90 mb-6">
            {t.cta.eyebrow}
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] mb-5">
            {t.cta.headline}{" "}
            <em className="font-serif italic font-normal text-[#8FB8A0]">
              {t.cta.headlineItalic}
            </em>
          </h2>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mb-10 leading-relaxed font-sans">
            {t.cta.subhead}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:contact@sentineliq.ai?subject=Enterprise%20Walkthrough%20Request"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#1F2430] hover:bg-[#FAF8F5] text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>{t.cta.primary}</span>
              <ArrowUpRight className="w-4 h-4 text-[#435278]" />
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold transition-all duration-200"
            >
              <Activity className="w-4 h-4 text-[#8FB8A0]" />
              <span>{t.cta.secondary}</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
