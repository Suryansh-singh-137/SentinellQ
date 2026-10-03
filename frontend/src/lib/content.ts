export type Language = 'en' | 'hi';

export const content = {
  en: {
    nav: {
      brand: "SentinelIQ",
      tagline: "AI Risk Platform",
      links: [
        { label: "Overview", href: "#overview" },
        { label: "Engines", href: "#platform" },
        { label: "Routing", href: "#routing" },
        { label: "Taxonomies", href: "#scams" },
        { label: "Explainability", href: "#explainability" },
        { label: "Early Warning", href: "#credit" },
        { label: "Compliance", href: "#compliance" },
      ],
      launchConsole: "Dashboard",
      requestDemo: "Request Demo",
    },
    hero: {
      eyebrow: "UNIFIED REAL-TIME RISK INTELLIGENCE",
      headlineLead: "Stop the scam before the payment.",
      headlineFollow: "Protect the loan",
      headlineItalic: "after.",
      subhead:
        "The first dual-risk AI engine executing sub-200ms pre-checkout fraud interception alongside proactive, event-driven loan default early warning.",
      ctaPrimary: "Request Demo",
      ctaSecondary: "Explore Dashboard",
      badgeText: "Sub-200ms Pre-Check Latency SLA",
      metrics: [
        { label: "Pre-check SLA", value: "<200ms" },
        { label: "Auto Handling", value: "99.5%" },
        { label: "Scam Taxonomies", value: "6 Classes" },
        { label: "Downstream NPAs", value: "-68%" },
      ],
      precheckCard: {
        liveBadge: "LIVE PRE-CHECK INTERCEPTION",
        channel: "UPI Instant Rail",
        statusLow: "Safe",
        statusMed: "Step-Up Required",
        statusHigh: "Intervention Hold",
        rbiCompliant: "RBI Explainability Ready",
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
    },
    problem: {
      eyebrow: "THE STRUCTURAL GAP",
      headline: "Fraud and credit risk shouldn't live in",
      headlineItalic: "separate silos.",
      description:
        "When an unmitigated scam drains a customer's liquid capital, they are unable to service upcoming debt. Within 30 to 60 days, a fraud victim becomes a non-performing loan default. Traditional banks discover distress only after an EMI bounces.",
      steps: [
        {
          step: "01",
          title: "Unmitigated Scam Event",
          desc: "Social engineering or mule transfer siphons liquid operational savings within seconds.",
          impact: "Immediate capital loss"
        },
        {
          step: "02",
          title: "Liquidity Drain & Shock",
          desc: "Deprived of savings, the customer cannot service upcoming Equated Monthly Instalments (EMIs).",
          impact: "Zero emergency runway"
        },
        {
          step: "03",
          title: "Downstream Loan Default",
          desc: "30-60 days later, credit monitoring flags the account as an NPA—when recovery costs are highest.",
          impact: "Irrecoverable balance"
        }
      ],
      callout: "SentinelIQ fuses point-in-time transaction telemetry directly into the credit stress pipeline, preventing the default before the first missed EMI."
    },
    engines: {
      eyebrow: "DUAL-ENGINE ARCHITECTURE",
      headline: "Two specialised engines. One unified",
      headlineItalic: "intelligence platform.",
      subhead:
        "Seamlessly integrating millisecond transactional interception with forward-looking borrower credit health.",
      engine1: {
        tag: "ENGINE 1",
        title: "Real-Time Payment Fraud Engine",
        sla: "Sub-200ms Latency SLA",
        desc: "Synchronous pre-check evaluating account velocity, device fingerprinting, and behavioral outliers before payment gateway initialization.",
        features: [
          "XGBoost 6-Class Scam Classifier",
          "Isolation Forest & Autoencoder Anomaly Scoring",
          "NetworkX Multi-Hop Mule Ring Graph (k ≤ 4)",
          "Perceptual Hashing (pHash) Brand Similarity"
        ]
      },
      engine2: {
        tag: "ENGINE 2",
        title: "Loan Repayment Risk & Early Warning",
        sla: "Nightly & Event-Driven Scoring",
        desc: "Continuously tracks borrower cash flow dynamics, EMI-to-income spikes, and liquidity runway to trigger restructuring before missed payments.",
        features: [
          "Quantitative EMI-to-Income (R_EMI) Tracking",
          "Days Past Due (DPD 0 → 1-30 → 30-60) Transition Gauges",
          "Income Shock (ΔI > 0.20) & Cash Burn Velocity",
          "Direct Fraud-to-Credit Loss Stress Linkage"
        ]
      },
      shared: {
        title: "Unified Explainability & Case Management Layer",
        desc: "Local SHAP feature contribution vectors converted to plain-English reason codes, feeding an algorithmically ranked human-in-the-loop investigation queue."
      }
    },
    routing: {
      eyebrow: "THREE-TIER ROUTING PROTOCOL",
      headline: "Deterministic decision routing under",
      headlineItalic: "200 milliseconds.",
      subhead:
        "Every transaction evaluates hard overrides and composite ML risk scores before reaching the payment gateway.",
      tiers: [
        {
          tier: "Tier 1: Low Risk",
          scoreRange: "Fraud Score < 40",
          color: "sage",
          action: "Automated Session Creation",
          outcome: "Checkout completes seamlessly; Juspay session initializes immediately without customer friction.",
          handling: "97.0% of Volume"
        },
        {
          tier: "Tier 2: Medium Risk",
          scoreRange: "40 ≤ Fraud Score < 70",
          color: "amber",
          action: "Context-Aware Step-Up Challenge",
          outcome: "Issues biometric verification or explicit warning: 'Collect request will DEBIT your account'. Confirmation resumes payment.",
          handling: "2.5% of Volume"
        },
        {
          tier: "Tier 3: High Risk",
          scoreRange: "Fraud Score ≥ 70",
          color: "coral",
          action: "Strict Gateway Session Block & Hold",
          outcome: "Blocks payment session, displays safety guidance, generates prioritized case in analyst queue, and pushes WebSocket alert.",
          handling: "0.5% of Volume"
        }
      ]
    },
    scams: {
      eyebrow: "THREAT TAXONOMY COVERAGE",
      headline: "Engineered to dismantle dynamic",
      headlineItalic: "scam vectors.",
      subhead:
        "Specialized behavioral detection rules and ML feature embeddings for the six primary threat vectors across UPI and digital banking.",
      items: [
        {
          id: "impersonation",
          name: "Impersonation Scams",
          summary: "Fraudsters posing as police, tax officials, or bank support with false psychological urgency.",
          indicators: "Active voice call during transfer, beneficiary registered < 10 mins ago, amount > 5x historical average.",
          rule: "Hard step-up enforced if payment initiated during ongoing phone call to newly added payee."
        },
        {
          id: "phishing",
          name: "Phishing & Cloned Merchants",
          summary: "Spoofed merchant web portals and malicious payment interfaces capturing authorization credentials.",
          indicators: "Domain age < 30 days, structural pHash distance d_H ≤ 10 to recognized brand landing pages.",
          rule: "Immediate block if merchant domain matches blacklisted domain database or spoofed certificate."
        },
        {
          id: "fake_refund",
          name: "Fake Refund Exploitation",
          summary: "Small initial inbound credit deposit followed by a high-value collect debit request under the guise of an error.",
          indicators: "Credit deposit succeeded within trailing 15-minute window prior to outgoing collect request.",
          rule: "Enforce biometric step-up on all collect pulls linked to recent unverified credits."
        },
        {
          id: "investment",
          name: "Investment & Task Scams",
          summary: "Multi-stage fraudulent yield platforms with rapid, escalating transfers to unverified corporate entities.",
          indicators: "Repeated payments with monotonically increasing amounts to same beneficiary within 48 hours.",
          rule: "Dynamic risk escalation upon 3rd sequential payment increment."
        },
        {
          id: "mule",
          name: "Mule Account Networks",
          summary: "Multi-hop money laundering chains utilizing high fan-in and rapid pass-through dispersion to cash-out points.",
          indicators: "Directed In-Degree Centrality C_D+ > 0.05, PageRank PR > 0.015, pass-through ratio > 90% within 1 hour.",
          rule: "Absolute transaction blockage if target destination is an identified active mule node."
        },
        {
          id: "collect",
          name: "Payment-Request (Collect) Scams",
          summary: "Malicious inbound UPI collect requests disguised as incoming funds, tricking users into entering PIN.",
          indicators: "Inbound collect request initiated by unlinked payee without prior transaction relationship.",
          rule: "Enforce safety popup explicitly confirming: 'Entering your UPI PIN will DEBIT funds from your account'."
        }
      ]
    },
    explainability: {
      eyebrow: "EXPLAINABLE AI BY DESIGN",
      headline: "No black boxes. Every decision is",
      headlineItalic: "human-auditable.",
      subhead:
        "Compliant with RBI algorithm explainability guidelines. Every automated hold or block generates deterministic SHAP attribution vectors.",
      sampleTitle: "Analyst Decision Attributions · Case #8941",
      customer: "Aarav Sharma · UPI Transfer ₹45,000",
      reasons: [
        { feature: "Device Fingerprint", impact: "+0.42", desc: "Hardware signature unrecognized (registered 4m prior)" },
        { feature: "Transaction Ratio", impact: "+0.38", desc: "Amount 8.2x higher than trailing 90-day baseline" },
        { feature: "Beneficiary Velocity", impact: "+0.29", desc: "Payee account created 6 minutes before payment session" },
        { feature: "Voice Call Active", impact: "+0.22", desc: "Device in active telecom call during payment entry" },
        { feature: "Customer KYC Age", impact: "-0.16", desc: "Full biometric KYC verified for 3.2 years" }
      ]
    },
    graph: {
      eyebrow: "GRAPH TOPOLOGY ANALYTICS",
      headline: "Visualize multi-hop money chains",
      headlineItalic: "before cash-out.",
      subhead:
        "NetworkX graph engine traces fund dispersion up to k ≤ 4 hops, flagging mule rings before digital traceability degrades at ATMs and physical agents.",
      victimNode: "Victim Accounts (Senders)",
      muleNode: "Layer 1 Mule Ring",
      aggregatorNode: "Aggregator Node (High Fan-In)",
      cashoutNode: "Physical Cash-Out Point (ATM/CDM)"
    },
    credit: {
      eyebrow: "PROACTIVE DEFAULT PREVENTION",
      headline: "Catch borrower distress 45 days before the",
      headlineItalic: "first missed payment.",
      subhead:
        "Operating on a 0–100 scale, the Loan Risk Engine tracks financial ratios, income shocks, and fraud losses to trigger early restructuring.",
      stages: [
        { name: "Healthy", range: "< 30", desc: "Standard credit profile. Automated processing and monitoring." },
        { name: "Watch", range: "30 – 54", desc: "Early warning threshold. Soft spending nudges and watchlist addition." },
        { name: "Stressed", range: "55 – 79", desc: "High default probability. Proactive restructuring offer triggered." },
        { name: "Default-Risk", range: "≥ 80", desc: "Severe risk. Immediate analyst intervention and salary deduction hooks." }
      ]
    },
    calculator: {
      eyebrow: "ROI & CAPITAL PRESERVATION",
      headline: "Calculate your projected capital",
      headlineItalic: "savings.",
      subhead: "See the financial impact of uniting real-time fraud intervention with proactive loan NPA mitigation.",
      monthlyVolume: "Monthly Digital Payment Volume",
      loanBook: "Active Borrower Loan Book",
      preventedFraud: "Projected Scam Losses Prevented / Mo",
      savedNpa: "Reduced Downstream NPA Provisions / Yr",
      combinedSavings: "Total Annual Risk Capital Preserved"
    },
    governance: {
      eyebrow: "SELF-LEARNING GOVERNANCE",
      headline: "Closed-loop model retraining with",
      headlineItalic: "zero bias drift.",
      subhead:
        "Automated nightly retraining on verified analyst ground truth, deployed in shadow mode with strict Population Stability Index monitoring.",
      steps: [
        { title: "Ground Truth Intake", desc: "Models train only on analyst-confirmed case resolutions, eliminating self-reinforcing bias." },
        { title: "Nightly Shadow Inference", desc: "Retrained candidates score transactions in parallel without affecting live routing." },
        { title: "Drift Monitoring (PSI & KS)", desc: "Quarantined if PSI ≥ 0.25 or KS p-value < 0.05 to ensure production stability." },
        { title: "Automated Champion Promotion", desc: "Promoted to production endpoints only upon statistically verified F1 & PR-AUC superiority." }
      ]
    },
    cta: {
      eyebrow: "READY FOR ENTERPRISE DEPLOYMENT",
      headline: "Defend transactional integrity. Preserve loan",
      headlineItalic: "portfolio quality.",
      subhead:
        "Schedule a technical walkthrough with our risk engineering team or explore the interactive developer sandbox.",
      primary: "Book a Technical Walkthrough",
      secondary: "Explore Dashboard"
    },
    footer: {
      desc: "Enterprise dual-risk AI monitoring platform engineered for digital banks, UPI payment processors, and modern credit institutions.",
      cols: [
        {
          title: "Platform",
          links: ["Real-Time Fraud Engine", "Loan Default Engine", "Mule Flow Analytics", "SHAP Explainability"]
        },
        {
          title: "Developers",
          links: ["API Documentation", "Juspay Pre-Check Hook", "WebSocket Threat Push", "Python SDK"]
        },
        {
          title: "Compliance",
          links: ["RBI Explainability Mandate", "India DPDP Act (2023)", "Immutable Audit Trail", "Security Architecture"]
        },
        {
          title: "Company",
          links: ["About SentinelIQ", "Risk Engineering Blog", "Careers", "Contact Security Team"]
        }
      ],
      copyright: "© 2026 SentinelIQ Technologies Inc. All rights reserved. Built for enterprise financial infrastructure."
    }
  },
  hi: {
    nav: {
      brand: "SentinelIQ",
      tagline: "एआई जोखिम मंच",
      links: [
        { label: "अवलोकन", href: "#overview" },
        { label: "इंजन", href: "#platform" },
        { label: "रूटिंग", href: "#routing" },
        { label: "वर्गीकरण", href: "#scams" },
        { label: "स्पष्टीकरण", href: "#explainability" },
        { label: "पूर्व चेतावनी", href: "#credit" },
        { label: "अनुपालन", href: "#compliance" },
      ],
      launchConsole: "डैशबोर्ड",
      requestDemo: "डेमो अनुरोध",
    },
    hero: {
      eyebrow: "एकीकृत रियल-टाइम जोखिम बुद्धिमत्ता",
      headlineLead: "भुगतान से पहले घोटाले को रोकें।",
      headlineFollow: "ऋण की सुरक्षा करें",
      headlineItalic: "बाद में।",
      subhead:
        "पहला दोहरा-जोखिम एआई इंजन जो 200ms से कम समय में भुगतान पूर्व धोखाधड़ी रोकता है और सक्रिय रूप से ऋण चूक की पूर्व चेतावनी देता है।",
      ctaPrimary: "डेमो का अनुरोध करें",
      ctaSecondary: "डैशबोर्ड देखें",
      badgeText: "200ms से कम प्री-चेक लेटेंसी एसएलए",
      metrics: [
        { label: "प्री-चेक समय", value: "<200ms" },
        { label: "स्वचालित प्रबंधन", value: "99.5%" },
        { label: "घोटाला श्रेणियां", value: "6 श्रेणियां" },
        { label: "एनपीए कमी", value: "-68%" },
      ],
      precheckCard: {
        liveBadge: "लाइव प्री-चेक इंटरसेप्शन",
        channel: "यूपीआई त्वरित रेल",
        statusLow: "सुरक्षित",
        statusMed: "पुष्टिकरण आवश्यक",
        statusHigh: "सुरक्षा रोक",
        rbiCompliant: "आरबीआई स्पष्टीकरण योग्य",
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
    },
    problem: {
      eyebrow: "संरचनात्मक अंतराल",
      headline: "धोखाधड़ी और ऋण जोखिम अलग-अलग",
      headlineItalic: "दायरे में नहीं रहने चाहिए।",
      description:
        "जब कोई बेरोकटोक घोटाला किसी ग्राहक की बचत खाली कर देता है, तो वह अगली ईएमआई चुकाने में असमर्थ हो जाता है। 30 से 60 दिनों के भीतर, धोखाधड़ी का शिकार व्यक्ति ऋण चूककर्ता बन जाता है।",
      steps: [
        {
          step: "01",
          title: "अनियंत्रित घोटाला घटना",
          desc: "सोशल इंजीनियरिंग या म्यूल खाता स्थानांतरण कुछ ही सेकंड में ग्राहक की तरल बचत छीन लेता है।",
          impact: "तत्काल वित्तीय नुकसान"
        },
        {
          step: "02",
          title: "तरलता की कमी और झटका",
          desc: "बचत खत्म होने से ग्राहक आगामी ईएमआई किस्तों का भुगतान करने में असमर्थ हो जाता है।",
          impact: "शून्य आपातकालीन बचत"
        },
        {
          step: "03",
          title: "ऋण चूक (एनपीए)",
          desc: "30-60 दिन बाद क्रेडिट सिस्टम खाते को एनपीए घोषित करता है—जब वसूली की संभावना न्यूनतम होती है।",
          impact: "अपरिवर्तनीय ऋण संकट"
        }
      ],
      callout: "SentinelIQ वास्तविक समय के लेनदेन संकेतों को सीधे क्रेडिट जोखिम से जोड़ता है, पहली ईएमआई चूकने से पहले ही ऋण पुनर्गठन शुरू करता है।"
    },
    engines: {
      eyebrow: "दोहरा इंजन ढांचा",
      headline: "दो समर्पित इंजन। एक एकीकृत",
      headlineItalic: "बुद्धिमत्ता मंच।",
      subhead:
        "मिलीसेकंड लेन-देन जांच को दीर्घकालिक ऋण स्वास्थ्य और नकदी प्रवाह निगरानी के साथ जोड़ना।",
      engine1: {
        tag: "इंजन 1",
        title: "रियल-टाइम भुगतान धोखाधड़ी इंजन",
        sla: "200ms से कम लेटेंसी एसएलए",
        desc: "पेमेंट गेटवे सत्र शुरू होने से पहले खाता वेग, डिवाइस फ़िंगरप्रिंटिंग और विसंगतियों का त्वरित मूल्यांकन।",
        features: [
          "XGBoost 6-श्रेणी घोटाला वर्गीकरण",
          "आइसोलेशन फ़ॉरेस्ट और ऑटोएनकोडर एनोमली स्कोरिंग",
          "NetworkX मल्टी-हॉप म्यूल रिंग ग्राफ़ (k ≤ 4)",
          "परसेप्चुअल हैशिंग (pHash) ब्रांड सुरक्षा"
        ]
      },
      engine2: {
        tag: "इंजन 2",
        title: "ऋण चुकौती जोखिम और पूर्व चेतावनी",
        sla: "दैनिक और घटना-आधारित स्कोरिंग",
        desc: "चूक से पहले पुनर्गठन की पेशकश करने के लिए ईएमआई-आय अनुपात, आय में गिरावट और नकदी प्रवाह पर नज़र रखता है।",
        features: [
          "ईएमआई-से-आय (R_EMI) का निरंतर मापन",
          "डीपीडी (DPD 0 → 1-30 → 30-60) संक्रमण निगरानी",
          "आय में अप्रत्याशित गिरावट (ΔI > 0.20) ट्रैकिंग",
          "धोखाधड़ी हानि से प्रत्यक्ष ऋण जोखिम लिंकेज"
        ]
      },
      shared: {
        title: "एकीकृत स्पष्टीकरण और केस प्रबंधन परत",
        desc: "लोकल SHAP फीचर वेक्टर सरल हिंदी और अंग्रेजी कारणों में परिवर्तित होते हैं, जो विश्लेषकों की प्राथमिकता सूची में जाते हैं।"
      }
    },
    routing: {
      eyebrow: "त्रि-स्तरीय निर्णय प्रणाली",
      headline: "200 मिलीसेकंड के भीतर",
      headlineItalic: "सटीक सुरक्षा रूटिंग।",
      subhead: "प्रत्येक लेन-देन पेमेंट गेटवे तक पहुँचने से पहले कड़े नियमों और एमएल जोखिम स्कोर से गुजरता है।",
      tiers: [
        {
          tier: "स्तर 1: कम जोखिम",
          scoreRange: "जोखिम स्कोर < 40",
          color: "sage",
          action: "स्वतः स्वीकृत और त्वरित सत्र",
          outcome: "भुगतान बिना किसी रुकावट के तुरंत सफल होता है।",
          handling: "कुल मात्रा का 97.0%"
        },
        {
          tier: "स्तर 2: मध्यम जोखिम",
          scoreRange: "40 ≤ जोखिम स्कोर < 70",
          color: "amber",
          action: "संदर्भ-आधारित ओटीपी / चेतावनी",
          outcome: "स्पष्ट चेतावनी: 'यह अनुरोध आपके खाते से पैसे काटेगा'। ग्राहक की पुष्टि पर ही आगे बढ़ता है।",
          handling: "कुल मात्रा का 2.5%"
        },
        {
          tier: "स्तर 3: उच्च जोखिम",
          scoreRange: "जोखिम स्कोर ≥ 70",
          color: "coral",
          action: "गेटवे सत्र पर पूर्ण रोक और अलर्ट",
          outcome: "लेनदेन को रोका जाता है, सुरक्षा स्क्रीन दिखती है, और विश्लेषक कतार में अलर्ट भेजा जाता है।",
          handling: "कुल मात्रा का 0.5%"
        }
      ]
    },
    scams: {
      eyebrow: "घोटाला सुरक्षा कवरेज",
      headline: "आधुनिक डिजिटल घोटालों को",
      headlineItalic: "जड़ से समाप्त करने के लिए निर्मित।",
      subhead: "यूपीआई और डिजिटल बैंकिंग पर सक्रिय 6 प्रमुख धोखाधड़ी प्रारूपों के लिए विशेष पहचान मॉडल।",
      items: [
        {
          id: "impersonation",
          name: "पहचान छुपाने वाले घोटाले",
          summary: "अधिकारी या बैंक कर्मचारी बनकर फर्जी तात्कालिकता पैदा करके पैसे ट्रांसफर करवाना।",
          indicators: "कॉल के दौरान ट्रांसफर, 10 मिनट पहले जुड़ा लाभार्थी, सामान्य से 5x अधिक राशि।",
          rule: "सक्रिय कॉल के दौरान नए लाभार्थी को भुगतान करने पर प्रत्यक्ष सुरक्षा जांच।"
        },
        {
          id: "phishing",
          name: "फ़िशिंग और नकली व्यापारी वेबसाइट्स",
          summary: "प्रमाणपत्र चुराने और पैसे मोड़ने के लिए बनाई गई क्लोन भुगतान वेबसाइट्स।",
          indicators: "डोमेन उम्र < 30 दिन, प्रसिद्ध ब्रांड्स के साथ विज़ुअल pHash समानता।",
          rule: "काली सूची में शामिल डोमेन से भुगतान अनुरोध आने पर तत्काल रोक।"
        },
        {
          id: "fake_refund",
          name: "फर्जी रिफंड घोटाले",
          summary: "पहले छोटा क्रेडिट जमा करना और फिर गलती सुधारने के नाम पर बड़ा कलेक्ट अनुरोध भेजना।",
          indicators: "कलेक्ट अनुरोध से ठीक 15 मिनट पहले खाते में छोटा अज्ञात क्रेडिट।",
          rule: "हाल ही में आए अनजान क्रेडिट से जुड़े सभी कलेक्ट अनुरोधों पर बायोमेट्रिक सत्यापन।"
        },
        {
          id: "investment",
          name: "निवेश और टास्क घोटाले",
          summary: "ऊंचे रिटर्न का वादा करके लगातार बढ़ती रकम मंगवाने वाले संगठित रैकेट।",
          indicators: "एक ही अनजान लाभार्थी को 48 घंटे में तेजी से बढ़ती राशि के कई ट्रांसफर।",
          rule: "तीसरी बार राशि बढ़ने पर स्वतः जोखिम स्तर में वृद्धि।"
        },
        {
          id: "mule",
          name: "म्यूल खाता नेटवर्क",
          summary: "कई खातों के माध्यम से तेजी से पैसा घुमाकर एटीएम से नकदी निकालने वाला मनी लॉन्ड्रिंग नेटवर्क।",
          indicators: "प्रति घंटे 10 से अधिक खातों से पैसा आना और 90% से अधिक राशि तुरंत बाहर जाना।",
          rule: "पहचाने गए सक्रिय म्यूल नोड पर तत्काल लेनदेन रोक।"
        },
        {
          id: "collect",
          name: "यूपीआई कलेक्ट अनुरोध घोटाले",
          summary: "आने वाले पैसे का झांसा देकर पीड़ित से यूपीआई पिन दर्ज कराके पैसे काटना।",
          indicators: "अपरिचित खाते से बिना किसी पिछले लेन-देन के अचानक आया कलेक्ट अनुरोध।",
          rule: "चेतावनी स्क्रीन: 'पिन दर्ज करने से आपके खाते से पैसे कटेंगे'."
        }
      ]
    },
    explainability: {
      eyebrow: "स्पष्ट और पारदर्शी एआई",
      headline: "कोई ब्लैक बॉक्स नहीं। हर निर्णय",
      headlineItalic: "मानव-समीक्षा योग्य है।",
      subhead: "आरबीआई के एल्गोरिथम व्याख्या दिशानिर्देशों के अनुरूप। प्रत्येक निर्णय के पीछे स्पष्ट SHAP विशेषताएँ।",
      sampleTitle: "विश्लेषक निर्णय विवरण · केस #8941",
      customer: "आरव शर्मा · यूपीआई ट्रांसफर ₹45,000",
      reasons: [
        { feature: "डिवाइस फ़िंगरप्रिंट", impact: "+0.42", desc: "अपरिचित हार्डवेयर (पहली बार 4 मिनट पहले दिखा)" },
        { feature: "लेनदेन अनुपात", impact: "+0.38", desc: "राशि पिछले 90 दिनों के औसत से 8.2 गुना अधिक" },
        { feature: "लाभार्थी वेग", impact: "+0.29", desc: "भुगतान से केवल 6 मिनट पहले नया खाता जोड़ा गया" },
        { feature: "सक्रिय कॉल स्थिति", impact: "+0.22", desc: "भुगतान के दौरान फोन कॉल सक्रिय थी" },
        { feature: "ग्राहक केवाईसी आयु", impact: "-0.16", desc: "ग्राहक 3.2 वर्षों से पूरी तरह सत्यापित है" }
      ]
    },
    graph: {
      eyebrow: "ग्राफ़ नेटवर्क विश्लेषण",
      headline: "कैश-आउट से पहले पैसे की श्रृंखला",
      headlineItalic: "को ट्रैक करें।",
      subhead: "NetworkX इंजन 4 हॉप तक धन के प्रवाह को ट्रैक करता है, एटीएम से नकदी निकलने से पहले म्यूल रिंग्स को पकड़ता है।",
      victimNode: "पीड़ित खाते (प्रेषक)",
      muleNode: "प्रथम स्तर म्यूल रिंग",
      aggregatorNode: "केंद्रीय संग्रह खाता (हाई फैन-इन)",
      cashoutNode: "नकदी निकासी बिंदु (एटीएम/एजेंट)"
    },
    credit: {
      eyebrow: "सक्रिय ऋण चूक निवारण",
      headline: "पहली ईएमआई चूकने से 45 दिन पहले",
      headlineItalic: "ऋण संकट को पहचानें।",
      subhead: "0 से 100 के पैमाने पर काम करने वाला ऋण जोखिम इंजन अग्रिम पुनर्गठन की सुविधा देता है।",
      stages: [
        { name: "स्वस्थ", range: "< 30", desc: "मानक क्रेडिट प्रोफाइल। नियमित स्वचालित निगरानी।" },
        { name: "निगरानी", range: "30 – 54", desc: "प्रारंभिक चेतावनी। निगरानी सूची में शामिल।" },
        { name: "तनावग्रस्त", range: "55 – 79", desc: "चूक की उच्च संभावना। अग्रिम पुनर्गठन प्रस्ताव जारी।" },
        { name: "चूक जोखिम", range: "≥ 80", desc: "गंभीर संकट। तत्काल विश्लेषक हस्तक्षेप।" }
      ]
    },
    calculator: {
      eyebrow: "आरओआई और पूंजी संरक्षण",
      headline: "अपनी अनुमानित पूंजी बचत की",
      headlineItalic: "गणना करें।",
      subhead: "रियल-टाइम सुरक्षा और ऋण डिफ़ॉल्ट निवारण के वित्तीय प्रभाव को स्वयं देखें।",
      monthlyVolume: "मासिक डिजिटल भुगतान मात्रा",
      loanBook: "सक्रिय ऋण पोर्टफोलियो",
      preventedFraud: "प्रति माह रोकी गई धोखाधड़ी राशि",
      savedNpa: "वार्षिक एनपीए प्रावधानों में बचत",
      combinedSavings: "कुल वार्षिक संरक्षित पूंजी"
    },
    governance: {
      eyebrow: "स्व-शिक्षण एआई गवर्नेंस",
      headline: "बिना किसी पूर्वाग्रह के",
      headlineItalic: "निरंतर मॉडल पुनर्प्रशिक्षण।",
      subhead: "सत्यापित विश्लेषक निर्णयों पर स्वचालित रूप से पुनः प्रशिक्षित मॉडल, शैडो मोड में सुरक्षित रूप से तैनात।",
      steps: [
        { title: "सत्यापित डेटा इनपुट", desc: "मॉडल केवल मानवीय रूप से मान्य परिणामों पर प्रशिक्षित होते हैं।" },
        { title: "शैडो मोड मूल्यांकन", desc: "पुनः प्रशिक्षित मॉडल लाइव सिस्टम को प्रभावित किए बिना समानांतर स्कोरिंग करते हैं।" },
        { title: "वितरण ड्रिफ्ट निगरानी", desc: "यदि PSI ≥ 0.25 या KS p-value < 0.05 हो तो मॉडल स्वतः क्वारंटीन हो जाता है।" },
        { title: "स्वचालित पदोन्नति", desc: "केवल सांख्यिकीय रूप से श्रेष्ठ सिद्ध होने पर ही मुख्य उत्पादन में तैनात किया जाता है।" }
      ]
    },
    cta: {
      eyebrow: "उद्यम परिनियोजन के लिए तैयार",
      headline: "लेनदेन की अखंडता की रक्षा करें। ऋण पोर्टफोलियो",
      headlineItalic: "की गुणवत्ता सुरक्षित रखें।",
      subhead: "हमारी तकनीकी टीम के साथ एक वॉकथ्रू शेड्यूल करें या इंटरैक्टिव डेवलपर कंसोल देखें।",
      primary: "तकनीकी वॉकथ्रू बुक करें",
      secondary: "डैशबोर्ड देखें"
    },
    footer: {
      desc: "डिजिटल बैंकों, यूपीआई भुगतान प्रदाताओं और आधुनिक ऋण संस्थानों के लिए निर्मित उद्यम जोखिम एआई निगरानी मंच।",
      cols: [
        {
          title: "मंच",
          links: ["रियल-टाइम धोखाधड़ी इंजन", "ऋण चूक इंजन", "म्यूल फ्लो विश्लेषण", "SHAP स्पष्टीकरण"]
        },
        {
          title: "डेवलपर्स",
          links: ["एपीआई दस्तावेज़", "जसपे प्री-चेक हुक", "वेबसॉकेट अलर्ट्स", "पायथन एसडीके"]
        },
        {
          title: "अनुपालन",
          links: ["आरबीआई दिशानिर्देश", "डीपीडीपी अधिनियम (2023)", "अपरिवर्तनीय ऑडिट ट्रेल", "सुरक्षा आर्किटेक्चर"]
        },
        {
          title: "कंपनी",
          links: ["SentinelIQ के बारे में", "जोखिम इंजीनियरिंग ब्लॉग", "करियर", "सुरक्षा टीम से संपर्क करें"]
        }
      ],
      copyright: "© 2026 SentinelIQ Technologies Inc. सर्वाधिकार सुरक्षित।"
    }
  }
};
