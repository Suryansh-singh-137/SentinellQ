"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { Zap, ShieldCheck, Eye, Scale } from "lucide-react";

const icons = [Zap, ShieldCheck, Eye, Scale];

export function TrustStrip() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-[rgba(31,36,48,0.06)] bg-[#FAF8F5]/60 py-10">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.trustStrip.items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs text-[#435278]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1F2430] font-sans">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#586071] leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
