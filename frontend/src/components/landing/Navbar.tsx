"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowUpRight, Menu, X, Activity } from "lucide-react";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[rgba(250,248,245,0.92)] backdrop-blur-md border-b border-[rgba(31,36,48,0.06)] shadow-xs"
          : "bg-[#FAF8F5]/70 backdrop-blur-xs border-b border-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Brand Wordmark & Emblem */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 mr-4 sm:mr-6 lg:mr-8 xl:mr-10 group focus:outline-none"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-2xs transition-transform duration-200 group-hover:scale-105 shrink-0">
              {/* Concentric dual-ring geometry */}
              <div className="absolute h-5.5 w-5.5 rounded-full border border-[#435278]/25 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-[#435278] flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-[#8FB8A0]" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[#1F2430] leading-none">
                {t.nav.brand}
              </span>
              <span className="text-[9px] tracking-[0.14em] uppercase text-[#586071] font-semibold mt-0.5">
                {t.nav.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {t.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-[#586071] hover:text-[#1F2430] hover:bg-black/[0.035] transition-all duration-150 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Controls: Language Toggle, Console Link & CTA */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0 ml-auto lg:ml-0">
            {/* Language Switcher Pill */}
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-2xs text-[11px] font-semibold text-[#586071]">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                  lang === "en"
                    ? "bg-[#435278] text-[#FFFFFF] shadow-2xs"
                    : "hover:text-[#1F2430]"
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                  lang === "hi"
                    ? "bg-[#435278] text-[#FFFFFF] shadow-2xs"
                    : "hover:text-[#1F2430]"
                }`}
                aria-label="Switch to Hindi"
              >
                हिन्दी
              </button>
            </div>

            {/* Launch Dashboard Access */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F6F4F0] border border-[rgba(31,36,48,0.12)] text-[#1F2430] text-xs font-medium shadow-2xs transition-all duration-150 hover:border-[rgba(31,36,48,0.25)] whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-[#8FB8A0]" />
              <span>{t.nav.launchConsole}</span>
            </Link>

            {/* Request Demo Primary CTA */}
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#435278] hover:bg-[#344161] text-white text-xs font-semibold shadow-xs transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 whitespace-nowrap"
            >
              <span>{t.nav.requestDemo}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-85" />
            </a>
          </div>

          {/* Mobile Menu Toggle & Compact Lang Switcher */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[10px] font-semibold text-[#586071]">
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
              className="p-2 rounded-xl border border-[rgba(31,36,48,0.08)] bg-white text-[#1F2430] shadow-2xs hover:bg-[#F6F4F0]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[rgba(31,36,48,0.06)] bg-[#FAF8F5] animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col gap-1">
              {t.nav.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-[#1F2430] hover:text-[#435278] rounded-lg hover:bg-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-2 border-t border-[rgba(31,36,48,0.06)] flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white border border-[rgba(31,36,48,0.1)] text-[#1F2430] font-medium text-xs shadow-2xs"
                >
                  <Activity className="w-3.5 h-3.5 text-[#8FB8A0]" />
                  <span>{t.nav.launchConsole}</span>
                </Link>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#435278] text-white font-semibold text-xs shadow-xs"
                >
                  <span>{t.nav.requestDemo}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-85" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
