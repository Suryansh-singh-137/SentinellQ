"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";

export function FooterSection() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[rgba(31,36,48,0.06)] bg-[#FAF8F5] py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs">
                <div className="h-5 w-5 rounded-full border border-[#435278]/40 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#435278] flex items-center justify-center">
                    <div className="h-1 w-1 rounded-full bg-[#8FB8A0]" />
                  </div>
                </div>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1F2430]">
                {t.nav.brand}
              </span>
            </Link>

            <p className="text-xs text-[#586071] leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#8FB8A0]" />
              <span className="text-[11px] font-mono text-[#586071]">
                System Online · Sub-200ms Latency SLA
              </span>
            </div>
          </div>

          {/* 4 Link Columns */}
          {t.footer.cols.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h5 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1F2430]">
                {col.title}
              </h5>
              <ul className="space-y-2">
                {col.links.map((linkText, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href="#"
                      className="text-xs text-[#586071] hover:text-[#1F2430] transition-colors"
                    >
                      {linkText}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[rgba(31,36,48,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A92A2]">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#1F2430]">Privacy Policy</a>
            <a href="#" className="hover:text-[#1F2430]">Terms of Service</a>
            <a href="#" className="hover:text-[#1F2430]">RBI Compliance Note</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
