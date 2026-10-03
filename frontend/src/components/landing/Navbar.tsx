"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { ArrowUpRight, Menu, X, Sparkles } from "lucide-react";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(250,248,245,0.92)] backdrop-blur-md border-b border-[rgba(31,36,48,0.06)] shadow-xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <Container>
        <div className="flex h-20 items-center justify-between">
          {/* Brand Wordmark & Geometric Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs transition-transform duration-300 group-hover:scale-105">
              {/* Dual-ring concentric geometry representing unified real-time fraud + proactive loan monitoring */}
              <div className="absolute h-6 w-6 rounded-full border border-[#435278]/30 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-[#435278] flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-[#8FB8A0]" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-[-0.02em] text-[#1F2430]">
                {t.nav.brand}
              </span>
              <span className="text-[10px] tracking-[0.14em] uppercase text-[#586071] font-medium -mt-1">
                {t.nav.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/shop"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F1F3F5] text-[#1F2430] hover:bg-[#E5E7EB] transition-colors"
            >
              🛒 Checkout Precheck (/shop)
            </Link>
            <Link
              href="/analyst"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#435278] text-white hover:bg-[#344161] transition-colors"
            >
              🛡️ Analyst Dashboard (/analyst)
            </Link>
            {t.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#586071] hover:text-[#1F2430] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Controls: Language Toggle & CTA */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Language Switcher Pill */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs text-xs font-medium text-[#586071]">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "en"
                    ? "bg-[#435278] text-[#FFFFFF] shadow-xs"
                    : "hover:text-[#1F2430]"
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "hi"
                    ? "bg-[#435278] text-[#FFFFFF] shadow-xs"
                    : "hover:text-[#1F2430]"
                }`}
                aria-label="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
            </div>

            {/* Sandbox Link */}
            <a
              href="#sandbox"
              className="text-sm font-medium text-[#586071] hover:text-[#1F2430] px-3 py-2 transition-colors duration-200"
            >
              {t.nav.sandbox}
            </a>

            {/* Request Demo Button */}
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#435278] hover:bg-[#344161] text-white text-sm font-medium shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <span>{t.nav.requestDemo}</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-3">
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-medium text-[#586071]">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded-full ${lang === "en" ? "bg-[#435278] text-white" : ""}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2 py-0.5 rounded-full ${lang === "hi" ? "bg-[#435278] text-white" : ""}`}
              >
                हिन्दी
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[rgba(31,36,48,0.08)] bg-white text-[#1F2430]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-[rgba(31,36,48,0.06)] bg-[#FAF8F5] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-3">
              {t.nav.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 text-base font-medium text-[#1F2430] hover:text-[#435278]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-full bg-[#435278] text-white font-medium text-sm shadow-xs"
                >
                  {t.nav.requestDemo}
                </a>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
