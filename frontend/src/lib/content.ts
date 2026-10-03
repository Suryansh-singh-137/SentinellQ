export type Language = 'en' | 'hi';

export const content = {
  en: {
    nav: {
      brand: "SentinelIQ",
      tagline: "AI Risk Platform",
      links: [
        { label: "Overview", href: "#overview" },
        { label: "Platform", href: "#platform" },
        { label: "Scam Coverage", href: "#scams" },
        { label: "Explainability", href: "#explainability" },
        { label: "Compliance", href: "#compliance" },
      ],
      requestDemo: "Request Demo",
      sandbox: "Live Sandbox",
    },
    hero: {
      eyebrow: "UNIFIED REAL-TIME RISK INTELLIGENCE",
      headlineLead: "Stop the scam before the payment.",
      headlineFollow: "Protect the loan",
      headlineItalic: "after.",
      subhead:
        "The first dual-risk AI engine executing sub-200ms pre-checkout fraud interception alongside proactive, event-driven loan default early warning.",
      ctaPrimary: "Request Demo",
      ctaSecondary: "View Live Sandbox",
      badgeText: "Sub-200ms Pre-Check Latency SLA",
      metrics: [
        { label: "Pre-check SLA", value: "<200ms" },
        { label: "Auto Handling", value: "99.5%" },
        { label: "Scam Detection", value: "6 Classes" },
      ],
      precheckCard: {
        liveBadge: "LIVE PRE-CHECK INTERCEPTION",
        orderId: "ORD_8941_UPI",
        channel: "UPI Instant Rail",
        customer: "Aarav Sharma",
        amount: "₹45,000.00",
        payee: "Merchant #892 (QuickGold Deals)",
        device: "Unrecognized Device · Pixel 8",
        statusLow: "Safe",
        statusMed: "Step-Up Required",
        statusHigh: "Intervention Hold",
        fraudScore: 88.5,
        decision: "HIGH RISK HOLD",
        latency: "142ms",
        rbiCompliant: "RBI Explainability Ready",
        reasons: [
          "Device fingerprint unrecognized (first seen 4m ago)",
          "Transaction magnitude 8.2x historical average",
          "Beneficiary account registered < 10 mins prior"
        ],
        toggleSim: "Simulate Scenario:"
      }
    },
    trustStrip: {
      items: [
        { title: "< 200ms Pre-Check", desc: "Deterministic synchronous interception before session creation" },
        { title: "99.5% Automation", desc: "97% auto-approved, 2.5% step-up, 0.5% human case review" },
        { title: "Zero Black-Box", desc: "Local SHAP feature attributions and plain-English codes" },
        { title: "Built for RBI & DPDP", desc: "Compliant auditability with immutable operational logs" }
      ]
    }
  },
  hi: {
    nav: {
      brand: "SentinelIQ",
      tagline: "एआई जोखिम मंच",
      links: [
        { label: "अवलोकन", href: "#overview" },
        { label: "प्लेटफ़ॉर्म", href: "#platform" },
        { label: "धोखाधड़ी कवरेज", href: "#scams" },
        { label: "स्पष्टीकरण", href: "#explainability" },
        { label: "अनुपालन", href: "#compliance" },
      ],
      requestDemo: "डेमो का अनुरोध करें",
      sandbox: "लाइव सैंडबॉक्स",
    },
    hero: {
      eyebrow: "एकीकृत रियल-टाइम जोखिम बुद्धिमत्ता",
      headlineLead: "भुगतान से पहले घोटाले को रोकें।",
      headlineFollow: "ऋण की सुरक्षा करें",
      headlineItalic: "बाद में।",
      subhead:
        "पहला दोहरा-जोखिम एआई इंजन जो 200ms से कम समय में भुगतान पूर्व धोखाधड़ी रोकता है और सक्रिय रूप से ऋण चूक की पूर्व चेतावनी देता है।",
      ctaPrimary: "डेमो का अनुरोध करें",
      ctaSecondary: "लाइव सैंडबॉक्स देखें",
      badgeText: "200ms से कम प्री-चेक लेटेंसी एसएलए",
      metrics: [
        { label: "प्री-चेक समय", value: "<200ms" },
        { label: "स्वचालित प्रबंधन", value: "99.5%" },
        { label: "घोटाला पहचान", value: "6 श्रेणियां" },
      ],
      precheckCard: {
        liveBadge: "लाइव प्री-चेक इंटरसेप्शन",
        orderId: "ORD_8941_UPI",
        channel: "यूपीआई त्वरित रेल",
        customer: "आरव शर्मा",
        amount: "₹45,000.00",
        payee: "व्यापारी #892 (क्विकगोल्ड डील्स)",
        device: "अपरिचित डिवाइस · पिक्सेल 8",
        statusLow: "सुरक्षित",
        statusMed: "पुष्टिकरण आवश्यक",
        statusHigh: "सुरक्षा रोक",
        fraudScore: 88.5,
        decision: "उच्च जोखिम रोक",
        latency: "142ms",
        rbiCompliant: "आरबीआई स्पष्टीकरण योग्य",
        reasons: [
          "डिवाइस फ़िंगरप्रिंट अपरिचित (पहली बार 4 मिनट पहले दिखा)",
          "लेनदेन राशि ऐतिहासिक औसत से 8.2 गुना अधिक",
          "लाभार्थी खाता 10 मिनट पहले ही जोड़ा गया"
        ],
        toggleSim: "परिदृश्य बदलें:"
      }
    },
    trustStrip: {
      items: [
        { title: "< 200ms प्री-चेक", desc: "सत्र बनने से पहले निश्चित और त्वरित सुरक्षा जांच" },
        { title: "99.5% स्वचालन", desc: "97% स्वतः स्वीकृत, 2.5% ओटीपी जांच, 0.5% विश्लेषक समीक्षा" },
        { title: "पारदर्शी निर्णय", desc: "लोकल SHAP वेक्टर और सरल हिंदी/अंग्रेजी कारण कोड" },
        { title: "आरबीआई एवं DPDP समर्थित", desc: "अपरिवर्तनीय ऑडिट लॉग्स के साथ पूर्ण नियामक अनुपालन" }
      ]
    }
  }
};
