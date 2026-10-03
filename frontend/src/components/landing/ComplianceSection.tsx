"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/Container";
import { ShieldCheck, Scale, FileText, Lock, CheckCircle2 } from "lucide-react";

export function ComplianceSection() {
  const { lang } = useLanguage();

  const complianceItems = [
    {
      icon: Scale,
      title: lang === "hi" ? "आरबीआई व्याख्या निर्देश" : "RBI Explainability Mandate",
      desc:
        lang === "hi"
          ? "प्रत्येक स्वचालित रोक या अस्वीकृति के पीछे स्थानीय SHAP विशेषताएँ और मानव-पठनीय कारण कोड अनिवार्य हैं।"
          : "Full algorithmic transparency with deterministic local SHAP vectors and human-readable reason codes for all automated holds."
    },
    {
      icon: Lock,
      title: lang === "hi" ? "डीपीडीपी अधिनियम (2023)" : "Digital Personal Data Protection Act",
      desc:
        lang === "hi"
          ? "हार्डवेयर फ़िंगरप्रिंटिंग और बायोमेट्रिक्स का क्रिप्टोग्राफ़िक हैशिंग के साथ कड़ा डेटा अलगाव।"
          : "Privacy-preserving telemetry hashing, strict device data isolation, and consent-first step-up authorization."
    },
    {
      icon: FileText,
      title: lang === "hi" ? "अपरिवर्तनीय ऑडिट ट्रेल" : "Immutable Audit Ledger",
      desc:
        lang === "hi"
          ? "प्रत्येक विश्लेषक निर्णय, नीति अद्यतन और हस्तक्षेप डेटाबेस audit_log तालिका में स्थायी रूप से दर्ज होता है।"
          : "Every case label, manual override, and credit restructuring event is logged immutably in relational audit_log tables."
    },
    {
      icon: ShieldCheck,
      title: lang === "hi" ? "आरबीएसी और सुरक्षा सीमाएं" : "Role-Based Access Control (RBAC)",
      desc:
        lang === "hi"
          ? "ग्राहक, विश्लेषक और व्यवस्थापक के बीच कड़ा क्रिप्टोग्राफिक सुरक्षा अलगाव।"
          : "Cryptographic JWT authentication enforcing strict boundary separation between customer, analyst, and admin roles."
    }
  ];

  return (
    <section id="compliance" className="py-24 lg:py-32 relative bg-[#F7F5F0]/60">
      <Container>
        <div className="max-w-3xl mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[#435278] shadow-xs mb-4">
            {lang === "hi" ? "नियामक अनुपालन और सुरक्षा" : "REGULATORY COMPLIANCE & SECURITY"}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[#1F2430] leading-[1.15] mb-5">
            {lang === "hi"
              ? "वित्तीय नियमों और पारदर्शिता"
              : "Built for regulatory scrutiny and"}{" "}
            <em className="font-serif italic font-normal text-[#435278]">
              {lang === "hi" ? "के लिए निर्मित।" : "auditability."}
            </em>
          </h2>
          <p className="text-base sm:text-lg text-[#586071] leading-relaxed">
            {lang === "hi"
              ? "SentinelIQ आधुनिक वित्तीय बुनियादी ढांचे के लिए भारत के नियामक मानकों के अनुसार बनाया गया है।"
              : "Engineered specifically for Indian financial regulations, ensuring zero black-box operational liabilities."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {complianceItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(31,36,48,0.08)] shadow-xs flex items-start gap-5"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] flex items-center justify-center text-[#435278] shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#1F2430] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#586071] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
