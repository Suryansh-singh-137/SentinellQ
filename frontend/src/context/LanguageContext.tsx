"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { content, Language } from "@/lib/content";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof content["en"];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  // Optional: check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sentineliq_lang") as Language;
    if (saved === "en" || saved === "hi") {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("sentineliq_lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: content[lang] }}>
      <div className={lang === "hi" ? "font-hindi" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
