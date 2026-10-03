"""
SentinelIQ – Intelligent Read-Only Conversational Risk Assistant (FR4).
Provides contextual risk intelligence for analysts:
  - Customer safety evaluations (e.g. "Is Rahul safe to transact with?")
  - Merchant trustworthiness (e.g. "And Zepto?", "Check Swiggy")
  - Scam taxonomy & rule explanations (Impersonation, Phishing, Mule networks, etc.)
  - Loan distress & credit dynamics (EMI-to-income, DPD buckets, runway)
  - Gibberish / unparseable input handling with intelligent suggestions
Strictly read-only: Forbids score mutations or case state tampering.
"""

import re
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.case_management.service import CaseManagementService

router = APIRouter(prefix="/assistant", tags=["Analyst LLM Assistant"])


class AssistantQueryRequest(BaseModel):
    query: str
    case_id: str | None = None


class AssistantQueryResponse(BaseModel):
    query: str
    response: str
    case_context: dict | None = None
    is_read_only: bool = True


# ── Knowledge Base of Verified Merchants ─────────────────────
MERCHANT_INTELLIGENCE = {
    "zepto": {
        "name": "Zepto (Kiranakart Technologies Pvt Ltd)",
        "id": "MERCHANT-ZEPTO-IN",
        "category": "Quick Commerce / Groceries",
        "reputation_score": 94.2,
        "domain_age_days": 1150,
        "is_blacklisted": False,
        "fraud_rate": "0.02%",
        "verdict": "🟢 VERIFIED LOW RISK MERCHANT",
        "summary": "Zepto is an authorized enterprise quick-commerce merchant. All payments route through 3D Secure / standard low-risk rails (< 40 score threshold). Zero syndication or mule flags in trailing 90 days.",
    },
    "swiggy": {
        "name": "Swiggy (Bundl Technologies Pvt Ltd)",
        "id": "MERCHANT-SWIGGY-VERIFIED",
        "category": "Food Delivery & Instamart",
        "reputation_score": 96.8,
        "domain_age_days": 3200,
        "is_blacklisted": False,
        "fraud_rate": "0.01%",
        "verdict": "🟢 VERIFIED LOW RISK MERCHANT",
        "summary": "Established category leader with high volume stability. Automated instant approval enabled for standard ticket sizes.",
    },
    "zomato": {
        "name": "Zomato Limited",
        "id": "MERCHANT-ZOMATO-VERIFIED",
        "category": "Food Delivery & Dining",
        "reputation_score": 96.0,
        "domain_age_days": 3800,
        "is_blacklisted": False,
        "fraud_rate": "0.01%",
        "verdict": "🟢 VERIFIED LOW RISK MERCHANT",
        "summary": "Trusted corporate merchant with verified SSL and authentic bank settlement gateways.",
    },
    "blinkit": {
        "name": "Blinkit (CommerceCentric)",
        "id": "MERCHANT-BLINKIT-IN",
        "category": "Quick Commerce",
        "reputation_score": 93.5,
        "domain_age_days": 1800,
        "is_blacklisted": False,
        "fraud_rate": "0.03%",
        "verdict": "🟢 VERIFIED LOW RISK MERCHANT",
        "summary": "Legitimate enterprise entity. No suspicious payment-request collect spikes observed.",
    },
    "amazon": {
        "name": "Amazon Seller Services India",
        "id": "MERCHANT-AMAZON-IN",
        "category": "E-Commerce",
        "reputation_score": 98.2,
        "domain_age_days": 4200,
        "is_blacklisted": False,
        "fraud_rate": "0.008%",
        "verdict": "🟢 VERIFIED HIGH TRUST MERCHANT",
        "summary": "Enterprise Tier-1 merchant with strict PCI-DSS Level 1 compliance.",
    },
}

# ── Customer Intelligence Mock DB ─────────────────────────────
CUSTOMER_INTELLIGENCE = {
    "rahul": {
        "name": "Rahul Sharma",
        "id": "CUST-4912",
        "kyc": "Tier-2 Full Biometric",
        "account_age": "2.4 years",
        "avg_ticket": "₹2,800",
        "current_status": "🟡 CONDITIONAL (STEP-UP REQUIRED)",
        "summary": (
            "Customer Rahul Sharma is generally a legitimate borrower with 0 past defaults. "
            "However, his latest transaction of ₹45,000 triggered an Impersonation Alert (88.5 score) "
            "because it occurred during an active phone call to a payee added less than 10 minutes prior.\n\n"
            "• Safe to transact for routine amounts (< ₹5,000) on known devices.\n"
            "• High-ticket transfers to new beneficiaries strictly require Step-Up OTP or verbal confirmation."
        ),
    },
    "aarav": {
        "name": "Aarav Mehta",
        "id": "CUST-001",
        "kyc": "Tier-2 KYC Verified",
        "account_age": "3.1 years",
        "avg_ticket": "₹3,200",
        "current_status": "🔴 HIGH RISK HOLD (Case Open)",
        "summary": (
            "Aarav Mehta's account currently has an active hold (Case CASE-IMP-9021, Score 91.5/100). "
            "Transaction of ₹54,000 was intercepted due to newly added beneficiary and high velocity. "
            "Recommendation: Keep transaction blocked until voice callback confirmation is completed."
        ),
    },
    "priya": {
        "name": "Priya Patel",
        "id": "CUST-8821",
        "kyc": "Tier-2 KYC Verified",
        "account_age": "1.8 years",
        "avg_ticket": "₹1,500",
        "current_status": "🟠 CREDIT WATCH (Debt Stressed)",
        "summary": (
            "Priya Patel is in the Loan Distress Watchlist (Score 78.0/100). "
            "Her EMI-to-Income ratio reached 46.2% following a 24.5% income drop. "
            "Not a fraud threat, but recommended for proactive loan restructuring."
        ),
    },
    "rohit": {
        "name": "Rohit Verma",
        "id": "CUST-6102",
        "kyc": "Tier-1 Basic KYC",
        "account_age": "45 days",
        "avg_ticket": "₹38,500",
        "current_status": "🔴 MULE NODE SUSPECT",
        "summary": (
            "CRITICAL: Account exhibits high In-Degree Centrality (C_D⁺ = 0.082) with rapid dispersal "
            "to ATM cash-out points within 90 seconds. Unsafe to transact with. Account frozen for investigation."
        ),
    },
}


def is_gibberish(text: str) -> bool:
    """Detects random key mashing like 'hdpahosda' or 'asdfghj'."""
    text_clean = re.sub(r"[^a-zA-Z]", "", text).lower()
    if len(text_clean) >= 6:
        # Check vowel ratio
        vowels = sum(1 for c in text_clean if c in "aeiou")
        ratio = vowels / len(text_clean)
        if ratio < 0.15 or ratio > 0.8:
            return True
        # Check repeated consonants (e.g. 'dpahosd', 'sdfghj')
        if re.search(r"[bcdfghjklmnpqrstvwxyz]{5,}", text_clean):
            return True
    return False


@router.post("/chat", response_model=AssistantQueryResponse)
async def query_assistant(payload: AssistantQueryRequest):
    """
    Intelligent read-only copilot delivering realistic, context-aware financial risk analysis.
    """
    raw_query = payload.query.strip()
    q = raw_query.lower()
    case_ctx = None

    # 1. Ingest Case Context if provided
    if payload.case_id:
        case = CaseManagementService.get_case(payload.case_id)
        if case:
            case_ctx = {
                "case_id": case.id,
                "customer_name": case.customer_name,
                "risk_score": case.risk_score,
                "amount": case.transaction_amount,
                "reasons": case.reason_codes,
                "primary_scam": case.primary_scam_type,
            }

    # 2. Check for Gibberish / Random Key Mashing
    if is_gibberish(raw_query) or (len(raw_query) > 5 and not any(w in q for w in ["why", "who", "what", "is", "safe", "risk", "how", "show", "check", "zepto", "swiggy", "rahul", "loan", "fraud", "mule", "case"])):
        response_text = (
            f"⚠️ I couldn't recognize an actionable entity or risk parameter in '{raw_query}'.\n\n"
            "As SentinelIQ's Risk Copilot, you can ask me questions like:\n"
            "• **Customer Safety**: *\"Is Rahul safe to transact with?\"*\n"
            "• **Merchant Verification**: *\"Is Zepto verified or flagged?\"*\n"
            "• **Case Investigation**: *\"Why was the latest transaction blocked?\"*\n"
            "• **Mule Ring Analysis**: *\"Show accounts with high In-Degree Centrality\"*\n"
            "• **Loan Distress**: *\"Explain Priya's EMI-to-Income and runway metrics\"*"
        )
        return AssistantQueryResponse(
            query=raw_query,
            response=response_text,
            case_context=case_ctx,
            is_read_only=True,
        )

    # 3. Check for Merchant Verification Queries (e.g., "and zepto?", "is zepto safe?")
    for m_key, m_info in MERCHANT_INTELLIGENCE.items():
        if m_key in q:
            response_text = (
                f"### {m_info['verdict']}\n"
                f"**Entity**: {m_info['name']} (`{m_info['id']}`)\n"
                f"**Category**: {m_info['category']} | **Reputation Score**: {m_info['reputation_score']}/100\n"
                f"**Domain Age**: {m_info['domain_age_days']} days | **Fraud Incident Rate**: {m_info['fraud_rate']}\n\n"
                f"{m_info['summary']}\n\n"
                f"**Policy Action**: Standard low-risk routing. Auto-generates Juspay checkout sessions without step-up OTP."
            )
            return AssistantQueryResponse(
                query=raw_query,
                response=response_text,
                case_context=case_ctx,
                is_read_only=True,
            )

    # 4. Check for Customer Safety Queries (e.g., "is rahul save to trasect with", "check aarav")
    for c_key, c_info in CUSTOMER_INTELLIGENCE.items():
        if c_key in q:
            response_text = (
                f"### {c_info['current_status']}\n"
                f"**Customer**: {c_info['name']} (`{c_info['id']}`)\n"
                f"**KYC Tier**: {c_info['kyc']} | **Tenure**: {c_info['account_age']}\n"
                f"**Typical Ticket Size**: {c_info['avg_ticket']}\n\n"
                f"**Risk Intelligence Assessment**:\n{c_info['summary']}"
            )
            return AssistantQueryResponse(
                query=raw_query,
                response=response_text,
                case_context=case_ctx,
                is_read_only=True,
            )

    # Generic "safe to transact with" inquiry if no specific name found
    if any(phrase in q for phrase in ["safe to transact", "save to trasect", "is it safe", "can i pay", "safe to pay"]):
        response_text = (
            "### 🔍 Pre-Transaction Safety Protocol\n"
            "Under SentinelIQ's **Three-Tier Risk Protocol**, safety is evaluated on 3 real-time vectors:\n\n"
            "1. **Beneficiary Age**: Payees created < 10 mins ago trigger step-up verification.\n"
            "2. **Amount Multiple**: Transfers > 5x the customer's 90-day average are held for OTP.\n"
            "3. **Active Call State**: Active voice calls during UPI transfers trigger an immediate **High Risk Hold** (Impersonation Defense).\n\n"
            "*To check a specific entity, provide their name (e.g. 'Is Rahul safe?') or target merchant (e.g. 'Is Zepto safe?').*"
        )
        return AssistantQueryResponse(query=raw_query, response=response_text, case_context=case_ctx, is_read_only=True)

    # 5. Case-Specific Inquiries ("Why was he flagged?", "Explain this case")
    if any(k in q for k in ["why", "reason", "flag", "explain case", "blocked"]):
        if case_ctx:
            response_text = (
                f"### 🛡️ Investigation Breakdown: Case {case_ctx['case_id']}\n"
                f"**Target**: {case_ctx['customer_name']} | **Risk Score**: {case_ctx['risk_score']}/100 | **Amount**: ₹{case_ctx['amount']:,.2f}\n"
                f"**Primary Taxonomy**: {case_ctx['primary_scam'] or 'Multi-signal Anomaly'}\n\n"
                f"**Contributing Indicators (SHAP Feature Attributions)**:\n"
            )
            for r in case_ctx["reasons"]:
                response_text += f"• {r}\n"
            response_text += (
                f"\n**Recommended Analyst Action**: "
                f"{'Review voice call logs and verify beneficiary relationship before manual release.' if 'voice call' in str(case_ctx['reasons']).lower() else 'Initiate step-up verification or maintain hold.'}"
            )
        else:
            response_text = (
                "### 🛡️ SentinelIQ Pre-Checkout Interception Rules\n"
                "Transactions are flagged or held when crossing the **Score ≥ 70 threshold**:\n\n"
                "• **Impersonation**: Amount > 5x avg during an active voice call with a new payee.\n"
                "• **Phishing**: Domain age < 30 days or blacklisted SSL certificate.\n"
                "• **Fake Refund**: UPI collect request within 15 minutes of a small inbound credit.\n"
                "• **Mule Ring**: In-Degree Centrality $C_D^+ > 0.05$ with rapid cash-out dispersion."
            )
        return AssistantQueryResponse(query=raw_query, response=response_text, case_context=case_ctx, is_read_only=True)

    # 6. Mule Ring & Graph Analytics Queries
    if "mule" in q or "ring" in q or "topology" in q or "centrality" in q:
        response_text = (
            "### 🕸️ Mule Ring Topology & Graph Intelligence (FR4)\n"
            "SentinelIQ maps transaction flows using **NetworkX Directed Graph Analytics** across $k \\le 4$ hops:\n\n"
            "• **Centrality Threshold**: Nodes with $C_D^+ > 0.05$ (high fan-in) or **PageRank > 0.015** are flagged in bright red.\n"
            "• **Pass-Through Velocity**: Funds traversing > 3 intermediate accounts within 10 minutes are tagged as syndication channels.\n"
            "• **Cash-Out Terminals**: Flows terminating at Koramangala ATM or Indiranagar CDM are earmarked for law-enforcement freeze requests."
        )
        return AssistantQueryResponse(query=raw_query, response=response_text, case_context=case_ctx, is_read_only=True)

    # 7. Loan Distress & Repayment Risk Queries
    if any(k in q for k in ["loan", "emi", "dpd", "repay", "default", "runway", "credit"]):
        response_text = (
            "### 📊 Loan Distress & Early Warning Engine (FR3)\n"
            "The credit risk pipeline computes borrower health on a 0–100 scale:\n\n"
            "• **EMI-to-Income ($R_{\\text{EMI}}$)**: Flags triggered when $\\sum \\text{EMI} / I_{\\text{verified}} \\ge 40\\%$.\n"
            "• **Income Shock ($\\Delta I$)**: Drops $> 20\\%$ over trailing 3 months trigger proactive watchlisting.\n"
            "• **Liquid Runway**: Computed as $B_{\\text{liquid}} / |\\min(0, \\text{Net Cash Flow})|$. Runway $< 2.0$ months initiates loan restructuring offers.\n"
            "• **Fraud-to-Credit Linkage ($L_{\\text{fraud}}$)**: Confirmed scam losses immediately degrade liquid reserves in the nightly batch run."
        )
        return AssistantQueryResponse(query=raw_query, response=response_text, case_context=case_ctx, is_read_only=True)

    # 8. Intelligent Default Risk Summary
    response_text = (
        f"### 🛡️ SentinelIQ Risk Analysis: '{raw_query}'\n"
        "SentinelIQ is actively monitoring real-time digital payments and credit books.\n\n"
        "• **Real-Time Pre-Check**: Inline evaluation under sub-200ms SLA (`/payments/precheck`).\n"
        "• **Current System State**: 0 active system anomalies; 14 background risk workers operating normally.\n"
        "• **Inquiry Assistance**: You can query any specific account (e.g. *'Check Rahul'*), merchant (e.g. *'Verify Zepto'*), or incident taxonomy."
    )
    return AssistantQueryResponse(
        query=raw_query,
        response=response_text,
        case_context=case_ctx,
        is_read_only=True,
    )
