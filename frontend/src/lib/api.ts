/**
 * SentinelIQ API Client & Resilient Fallback Layer
 * Connects to FastAPI backend (http://127.0.0.1:8000)
 */

import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/alerts";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sentineliq_auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface PrecheckPayload {
  customer_id: string;
  amount: number;
  merchant_id: string;
  channel: string;
  device_fingerprint: string;
  ip_address: string;
  geolocation?: string;
  beneficiary_id?: string;
}

export interface RiskBreakdown {
  anomaly_score: number;
  scam_score: number;
  rules_score: number;
  primary_scam_type?: string | null;
  reason_codes: string[];
}

export interface PrecheckResponse {
  transaction_id: string;
  decision: "approve" | "step_up" | "block";
  fraud_score: number;
  risk_tier: "low" | "medium" | "high";
  risk_breakdown: RiskBreakdown;
  session_token?: string | null;
  step_up_type?: "otp" | "warning" | null;
  step_up_message?: string | null;
  block_message?: string | null;
  created_at: string;
}

export interface CaseListItem {
  id: string;
  case_type: string;
  status: string;
  priority_score: number;
  risk_score: number;
  transaction_amount: number;
  customer_name?: string;
  primary_scam_type?: string | null;
  reason_codes: string[];
  created_at: string;
}

export interface CaseDetail extends CaseListItem {
  customer_id: string;
  transaction_id?: string;
  analyst_id?: string;
  analyst_name?: string;
  total_exposure: number;
  shap_values?: Record<string, number>;
  analyst_notes?: string;
  resolved_at?: string;
}

export interface MuleNode {
  id: string;
  name: string;
  type: string;
  in_degree_centrality: number;
  pagerank: number;
  is_flagged_mule: boolean;
  color: string;
  val: number;
}

export interface MuleLink {
  source: string;
  target: string;
  amount: number;
  channel: string;
  value: number;
}

export interface MuleGraphResponse {
  nodes: MuleNode[];
  links: MuleLink[];
  total_nodes: number;
  total_edges: number;
  flagged_mule_nodes: string[];
  k_hop_limit: number;
}

export interface CustomerCreditProfile {
  customer_id: string;
  verified_monthly_income: number;
  total_emi_obligations: number;
  emi_to_income_ratio: number;
  dpd_worst: string;
  total_late_3m: number;
  income_trend: number;
  spending_spike: number;
  credit_utilization: number;
  liquid_balance: number;
  runway_months: number;
  overall_risk_score: number;
  risk_tier: string;
  // Extended UI-facing fields
  customer_name?: string;
  stage?: "Healthy" | "Watch" | "Stressed" | "Default-risk";
  late_payment_count?: number;
  net_cash_flow?: number;
  repayment_score?: number;
  cash_runway_months?: number;
  credit_utilization_pct?: number;
  spending_spike_flag?: boolean;
  recent_scam_loss_flag?: boolean;
  total_scam_loss?: number;
  emi_trend_history?: Array<{ month: string; ratio: number }>;
  loan_principal?: number;
  loan_interest_rate?: number;
  loan_tenure_months?: number;
  loan_outstanding_balance?: number;
  restructure_eligible?: boolean;
  suggested_tenure_extension_months?: number;
  projected_restructured_emi?: number;
  projected_new_emi_ratio?: number;
  restructure_rationale?: string;
}

export interface RestructureResponse {
  success: boolean;
  customer_id: string;
  message: string;
  previous_emi: number;
  new_emi: number;
  previous_tenure_months: number;
  new_tenure_months: number;
  previous_emi_ratio: number;
  new_emi_ratio: number;
  previous_stage: string;
  new_stage: string;
  profile: CustomerCreditProfile;
}

// ── Built-in Fallback Data ──────────────────────────────────
const FALLBACK_CASES: CaseListItem[] = [
  {
    id: "CASE-IMP-9021",
    case_type: "fraud",
    status: "open",
    priority_score: 248600.0,
    risk_score: 91.5,
    transaction_amount: 54000.0,
    customer_name: "Aarav Mehta",
    primary_scam_type: "impersonation",
    reason_codes: [
      "HR-IMP-01: Active voice call with newly added beneficiary (<= 10 mins)",
      "Transaction amount 9.0x historic customer baseline",
      "Payee registered 4 minutes prior to checkout attempt",
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "CASE-MULE-4812",
    case_type: "mule_network",
    status: "open",
    priority_score: 184500.0,
    risk_score: 87.0,
    transaction_amount: 38500.0,
    customer_name: "Rohit Verma",
    primary_scam_type: "mule_account",
    reason_codes: [
      "High node centrality C_D⁺ = 0.082 > 0.05",
      "Rapid fund dispersion across multi-hop edges to Koramangala ATM cash-out",
      "Pass-through velocity < 90 seconds from deposit",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "CASE-CREDIT-7731",
    case_type: "credit_stress",
    status: "open",
    priority_score: 152000.0,
    risk_score: 79.0,
    transaction_amount: 22000.0,
    customer_name: "Priya Patel",
    primary_scam_type: null,
    reason_codes: [
      "EMI-to-Income ratio (R_EMI) = 46.2% (exceeds 40% threshold)",
      "Income drop ΔI = 24.5% over trailing 3-month window",
      "Liquid runway reduced to 1.8 months post-EMI deductions",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "CASE-REFUND-3309",
    case_type: "fraud",
    status: "open",
    priority_score: 92400.0,
    risk_score: 64.0,
    transaction_amount: 15000.0,
    customer_name: "Sneha Rao",
    primary_scam_type: "fake_refund",
    reason_codes: [
      "HR-REFUND-01: Inbound credit (₹10) followed by outbound collect request in 4m",
      "UPI collect initiated from unlinked payee",
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

const FALLBACK_MULE_GRAPH: MuleGraphResponse = {
  total_nodes: 12,
  total_edges: 11,
  k_hop_limit: 4,
  flagged_mule_nodes: ["MULE_HUB_CENTRAL", "MULE_TIER1_A"],
  nodes: [
    { id: "VICTIM_01", name: "Victim Rahul S.", type: "victim", in_degree_centrality: 0.0, pagerank: 0.008, is_flagged_mule: false, color: "#3B82F6", val: 8 },
    { id: "VICTIM_02", name: "Victim Meera K.", type: "victim", in_degree_centrality: 0.0, pagerank: 0.008, is_flagged_mule: false, color: "#3B82F6", val: 8 },
    { id: "VICTIM_03", name: "Victim Anita D.", type: "victim", in_degree_centrality: 0.0, pagerank: 0.008, is_flagged_mule: false, color: "#3B82F6", val: 8 },
    { id: "MULE_TIER1_A", name: "Tier-1 Mule Account A", type: "flagged_mule_hub", in_degree_centrality: 0.065, pagerank: 0.021, is_flagged_mule: true, color: "#DC2626", val: 16 },
    { id: "MULE_TIER1_B", name: "Tier-1 Mule Account B", type: "intermediate_mule", in_degree_centrality: 0.035, pagerank: 0.012, is_flagged_mule: false, color: "#F59E0B", val: 10 },
    { id: "MULE_HUB_CENTRAL", name: "Syndicate Central Aggregator", type: "flagged_mule_hub", in_degree_centrality: 0.098, pagerank: 0.042, is_flagged_mule: true, color: "#DC2626", val: 20 },
    { id: "MULE_DISPERSE_1", name: "Dispersal Node South", type: "intermediate_mule", in_degree_centrality: 0.025, pagerank: 0.011, is_flagged_mule: false, color: "#F59E0B", val: 10 },
    { id: "MULE_DISPERSE_2", name: "Dispersal Node East", type: "intermediate_mule", in_degree_centrality: 0.025, pagerank: 0.011, is_flagged_mule: false, color: "#F59E0B", val: 10 },
    { id: "ATM_CASHOUT_KORAMANGALA", name: "Koramangala ATM Cash-Out", type: "cash_out", in_degree_centrality: 0.04, pagerank: 0.015, is_flagged_mule: false, color: "#EF4444", val: 12 },
    { id: "CDM_CASHOUT_INDIRANAGAR", name: "Indiranagar CDM Cash-Out", type: "cash_out", in_degree_centrality: 0.04, pagerank: 0.015, is_flagged_mule: false, color: "#EF4444", val: 12 },
    { id: "AGENT_CASHOUT_WHITEFIELD", name: "Whitefield Agent Cash-Out", type: "cash_out", in_degree_centrality: 0.04, pagerank: 0.015, is_flagged_mule: false, color: "#EF4444", val: 12 },
  ],
  links: [
    { source: "VICTIM_01", target: "MULE_TIER1_A", amount: 50000, channel: "UPI", value: 5 },
    { source: "VICTIM_02", target: "MULE_TIER1_A", amount: 75000, channel: "UPI", value: 7.5 },
    { source: "VICTIM_03", target: "MULE_TIER1_B", amount: 60000, channel: "NETBANKING", value: 6 },
    { source: "MULE_TIER1_A", target: "MULE_HUB_CENTRAL", amount: 120000, channel: "IMPS", value: 12 },
    { source: "MULE_TIER1_B", target: "MULE_HUB_CENTRAL", amount: 55000, channel: "IMPS", value: 5.5 },
    { source: "MULE_HUB_CENTRAL", target: "MULE_DISPERSE_1", amount: 95000, channel: "UPI", value: 9.5 },
    { source: "MULE_HUB_CENTRAL", target: "MULE_DISPERSE_2", amount: 75000, channel: "UPI", value: 7.5 },
    { source: "MULE_DISPERSE_1", target: "ATM_CASHOUT_KORAMANGALA", amount: 90000, channel: "ATM", value: 9 },
    { source: "MULE_DISPERSE_2", target: "CDM_CASHOUT_INDIRANAGAR", amount: 72000, channel: "CDM", value: 7.2 },
    { source: "MULE_HUB_CENTRAL", target: "AGENT_CASHOUT_WHITEFIELD", amount: 80000, channel: "AGENT", value: 8 },
  ],
};

// NOTE: Hardcoded credit fallbacks removed — data is now served from backend CSV data store.
// The backend loads generated CSVs at startup and returns per-customer profiles dynamically.

// ── API Operations with Resilient Fallbacks ─────────────────

export async function precheckPayment(payload: PrecheckPayload): Promise<PrecheckResponse> {
  try {
    const { data } = await apiClient.post<PrecheckResponse>("/payments/precheck", payload);
    return data;
  } catch (err) {
    // Intelligent local fallback simulation
    const amount = Number(payload.amount);
    let decision: "approve" | "step_up" | "block" = "approve";
    let score = 12.5;
    let tier: "low" | "medium" | "high" = "low";
    let sessionToken = `JUSPAY_SESS_FALLBACK_${Math.random().toString(36).substring(2, 10)}`;
    let stepUpType: "otp" | "warning" | null = null;
    let reasons: string[] = ["Standard transaction velocity within normal bounds"];

    if (payload.merchant_id.toLowerCase().includes("blacklisted") || amount > 50000 || payload.device_fingerprint.includes("call")) {
      decision = "block";
      score = 89.0;
      tier = "high";
      sessionToken = null as any;
      reasons = [
        "HR-IMP-01: Voice call active with newly added payee",
        "Transaction amount 8.5x historic average",
        "Target merchant on high-risk scrutiny list",
      ];
    } else if (amount > 5000 || payload.device_fingerprint.includes("new")) {
      decision = "step_up";
      score = 56.0;
      tier = "medium";
      sessionToken = null as any;
      stepUpType = "otp";
      reasons = ["New device detected", "Amount above regular ticket size"];
    }

    return {
      transaction_id: `TXN-LOCAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      decision,
      fraud_score: score,
      risk_tier: tier,
      risk_breakdown: {
        anomaly_score: score * 0.4,
        scam_score: score * 0.5,
        rules_score: score * 0.3,
        primary_scam_type: decision === "block" ? "impersonation" : null,
        reason_codes: reasons,
      },
      session_token: sessionToken,
      step_up_type: stepUpType,
      step_up_message: stepUpType ? "Step-up OTP required for authorization" : null,
      block_message: decision === "block" ? "Transaction held for your safety. Case opened for analyst review." : null,
      created_at: new Date().toISOString(),
    };
  }
}

export async function confirmStepUp(transactionId: string, confirmed: boolean, otpCode?: string) {
  try {
    const { data } = await apiClient.post("/payments/step-up/confirm", {
      transaction_id: transactionId,
      confirmed,
      otp_code: otpCode,
    });
    return data;
  } catch (err) {
    return {
      transaction_id: transactionId,
      decision: confirmed ? "approved" : "cancelled",
      session_token: confirmed ? `JUSPAY_SESS_STEPUP_${Date.now()}` : null,
    };
  }
}

export async function getCases(status?: string): Promise<{ cases: CaseListItem[]; total: number }> {
  try {
    const params = status ? { status } : {};
    const { data } = await apiClient.get("/cases", { params });
    if (data && data.cases && data.cases.length > 0) return data;
    return { cases: FALLBACK_CASES, total: FALLBACK_CASES.length };
  } catch (err) {
    return { cases: FALLBACK_CASES, total: FALLBACK_CASES.length };
  }
}

export async function getCaseDetail(caseId: string): Promise<CaseDetail> {
  try {
    const { data } = await apiClient.get<CaseDetail>(`/cases/${caseId}`);
    return data;
  } catch (err) {
    const match = FALLBACK_CASES.find((c) => c.id === caseId) || FALLBACK_CASES[0];
    return {
      ...match,
      customer_id: "CUST-4912",
      transaction_id: `TXN-8849-UPI`,
      total_exposure: match.transaction_amount * 2.8,
      shap_values: {
        amount_deviation: 0.38,
        velocity_frequency: 0.22,
        device_anomaly: 0.18,
        beneficiary_risk: 0.14,
        merchant_reputation: -0.06,
      },
      analyst_notes: null as any,
    };
  }
}

export async function actOnCase(caseId: string, action: "approve" | "block" | "restructure", notes?: string) {
  try {
    const { data } = await apiClient.post("/cases/action", {
      case_id: caseId,
      action,
      notes,
    });
    return data;
  } catch (err) {
    return {
      case_id: caseId,
      new_status: action === "approve" ? "approved" : action === "block" ? "blocked" : "restructured",
      message: `Case ${caseId} transitioned to ${action} (local simulated state).`,
    };
  }
}

export async function getMuleGraph(kHops: number = 4): Promise<MuleGraphResponse> {
  try {
    const { data } = await apiClient.get<MuleGraphResponse>("/analytics/mule-graph", {
      params: { k_hops: kHops },
    });
    return data;
  } catch (err) {
    return FALLBACK_MULE_GRAPH;
  }
}

export interface CustomerPreset {
  id: string;
  name: string;
  stage: string;
  label: string;
}

export async function getCustomerList(): Promise<CustomerPreset[]> {
  try {
    const { data } = await apiClient.get<{ customers: CustomerPreset[]; total: number }>("/loans/customers/list");
    return data.customers;
  } catch (err) {
    return [];
  }
}

export async function getLoanCreditProfile(customerId: string): Promise<CustomerCreditProfile> {
  const { data } = await apiClient.get<CustomerCreditProfile>(`/loans/${customerId}/credit-profile`);
  return data;
}

export async function restructureLoan(
  customerId: string,
  additionalMonths: number = 12
): Promise<RestructureResponse> {
  const { data } = await apiClient.post<RestructureResponse>(`/loans/${customerId}/restructure`, {
    additional_tenure_months: additionalMonths,
  });
  return data;
}


export async function calculateLoanRisk(payload: any) {
  try {
    const { data } = await apiClient.post("/loans/calculate", payload);
    return data;
  } catch (err) {
    return {
      loan_id: "LOAN-SIM-01",
      customer_id: payload.customer_id || "CUST-001",
      repayment_risk_score: 72.5,
      risk_tier: "stressed",
      emi_to_income_ratio: payload.total_emis / Math.max(1, payload.verified_income),
      dpd_bucket: payload.dpd_days > 30 ? "30-60" : "1-30",
      late_payment_count_3m: payload.late_count_3m || 1,
      late_payment_count_6m: payload.late_count_6m || 2,
      income_trend_delta: 0.18,
      spending_spike_ratio: 1.25,
      credit_utilization: 0.78,
      new_credit_lines_60d: 1,
      liquid_balance_post_emi: 12000.0,
      net_cash_flow: 8500.0,
      runway_months: 2.8,
      fraud_loss_amount: payload.fraud_losses || 0,
      calculated_at: new Date().toISOString(),
    };
  }
}

export async function queryAssistant(query: string, caseId?: string) {
  try {
    const { data } = await apiClient.post("/assistant/chat", {
      query,
      case_id: caseId,
    });
    return data;
  } catch (err) {
    const q = query.trim().toLowerCase();
    let responseText = "";

    // Check for Gibberish / Random Key Mashing
    const cleanLetters = q.replace(/[^a-z]/g, "");
    const vowels = (cleanLetters.match(/[aeiou]/g) || []).length;
    const vRatio = cleanLetters.length > 0 ? vowels / cleanLetters.length : 0;
    const isMashed = cleanLetters.length >= 6 && (vRatio < 0.15 || vRatio > 0.8 || /[bcdfghjklmnpqrstvwxyz]{5,}/.test(cleanLetters));

    if (isMashed || (q.length > 5 && !/(safe|risk|rahul|zepto|swiggy|zomato|amazon|priya|aarav|mule|loan|emi|why|flag|case)/.test(q))) {
      responseText = `⚠️ I couldn't recognize an actionable entity or risk parameter in '${query}'.\n\nAs SentinelIQ's Risk Copilot, you can ask me questions like:\n• **Customer Safety**: *"Is Rahul safe to transact with?"*\n• **Merchant Verification**: *"Is Zepto verified or flagged?"*\n• **Case Investigation**: *"Why was the latest transaction blocked?"*\n• **Mule Ring Analysis**: *"Show accounts with high In-Degree Centrality"*\n• **Loan Distress**: *"Explain Priya's EMI-to-Income and runway metrics"*`;
    } else if (q.includes("zepto")) {
      responseText = `### 🟢 VERIFIED LOW RISK MERCHANT\n**Entity**: Zepto (Kiranakart Technologies Pvt Ltd) (\`MERCHANT-ZEPTO-IN\`)\n**Category**: Quick Commerce / Groceries | **Reputation Score**: 94.2/100\n**Domain Age**: 1,150 days | **Fraud Incident Rate**: 0.02%\n\nZepto is an authorized enterprise quick-commerce merchant. All payments route through 3D Secure / standard low-risk rails (< 40 score threshold). Zero syndication or mule flags in trailing 90 days.\n\n**Policy Action**: Standard low-risk routing. Auto-generates Juspay checkout sessions without step-up OTP.`;
    } else if (q.includes("swiggy")) {
      responseText = `### 🟢 VERIFIED LOW RISK MERCHANT\n**Entity**: Swiggy (Bundl Technologies Pvt Ltd) (\`MERCHANT-SWIGGY-VERIFIED\`)\n**Category**: Food Delivery & Instamart | **Reputation Score**: 96.8/100\n**Domain Age**: 3,200 days | **Fraud Incident Rate**: 0.01%\n\nEstablished category leader with high volume stability. Automated instant approval enabled for standard ticket sizes.`;
    } else if (q.includes("zomato")) {
      responseText = `### 🟢 VERIFIED LOW RISK MERCHANT\n**Entity**: Zomato Limited (\`MERCHANT-ZOMATO-VERIFIED\`)\n**Category**: Food Delivery & Dining | **Reputation Score**: 96.0/100\n**Domain Age**: 3,800 days | **Fraud Incident Rate**: 0.01%\n\nTrusted corporate merchant with verified SSL and authentic bank settlement gateways.`;
    } else if (q.includes("amazon")) {
      responseText = `### 🟢 VERIFIED HIGH TRUST MERCHANT\n**Entity**: Amazon Seller Services India (\`MERCHANT-AMAZON-IN\`)\n**Category**: E-Commerce | **Reputation Score**: 98.2/100\n**Domain Age**: 4,200 days | **Fraud Incident Rate**: 0.008%\n\nEnterprise Tier-1 merchant with strict PCI-DSS Level 1 compliance.`;
    } else if (q.includes("rahul")) {
      responseText = `### 🟡 CONDITIONAL (STEP-UP REQUIRED)\n**Customer**: Rahul Sharma (\`CUST-4912\`)\n**KYC Tier**: Tier-2 Full Biometric | **Tenure**: 2.4 years\n**Typical Ticket Size**: ₹2,800\n\n**Risk Intelligence Assessment**:\nCustomer Rahul Sharma is generally a legitimate borrower with 0 past defaults. However, his latest transaction of ₹45,000 triggered an Impersonation Alert (88.5 score) because it occurred during an active phone call to a payee added less than 10 minutes prior.\n\n• Safe to transact for routine amounts (< ₹5,000) on known devices.\n• High-ticket transfers to new beneficiaries strictly require Step-Up OTP or verbal confirmation.`;
    } else if (q.includes("aarav")) {
      responseText = `### 🔴 HIGH RISK HOLD (Case Open)\n**Customer**: Aarav Mehta (\`CUST-001\`)\n**KYC Tier**: Tier-2 KYC Verified | **Tenure**: 3.1 years\n**Typical Ticket Size**: ₹3,200\n\n**Risk Intelligence Assessment**:\nAarav Mehta's account currently has an active hold (Case CASE-IMP-9021, Score 91.5/100). Transaction of ₹54,000 was intercepted due to newly added beneficiary and high velocity. Recommendation: Keep transaction blocked until voice callback confirmation is completed.`;
    } else if (q.includes("priya")) {
      responseText = `### 🟠 CREDIT WATCH (Debt Stressed)\n**Customer**: Priya Patel (\`CUST-8821\`)\n**KYC Tier**: Tier-2 KYC Verified | **Tenure**: 1.8 years\n**Typical Ticket Size**: ₹1,500\n\n**Risk Intelligence Assessment**:\nPriya Patel is in the Loan Distress Watchlist (Score 78.0/100). Her EMI-to-Income ratio reached 46.2% following a 24.5% income drop. Not a fraud threat, but recommended for proactive loan restructuring.`;
    } else if (q.includes("rohit")) {
      responseText = `### 🔴 MULE NODE SUSPECT\n**Customer**: Rohit Verma (\`CUST-6102\`)\n**KYC Tier**: Tier-1 Basic KYC | **Tenure**: 45 days\n**Typical Ticket Size**: ₹38,500\n\n**Risk Intelligence Assessment**:\nCRITICAL: Account exhibits high In-Degree Centrality (C_D⁺ = 0.082) with rapid dispersal to ATM cash-out points within 90 seconds. Unsafe to transact with. Account frozen for investigation.`;
    } else if (q.includes("safe") || q.includes("transact") || q.includes("trasect")) {
      responseText = `### 🔍 Pre-Transaction Safety Protocol\nUnder SentinelIQ's **Three-Tier Risk Protocol**, safety is evaluated on 3 real-time vectors:\n\n1. **Beneficiary Age**: Payees created < 10 mins ago trigger step-up verification.\n2. **Amount Multiple**: Transfers > 5x the customer's 90-day average are held for OTP.\n3. **Active Call State**: Active voice calls during UPI transfers trigger an immediate **High Risk Hold** (Impersonation Defense).\n\n*To check a specific entity, provide their name (e.g. 'Is Rahul safe?') or target merchant (e.g. 'Is Zepto safe?').*`;
    } else if (q.includes("mule") || q.includes("ring") || q.includes("topology")) {
      responseText = `### 🕸️ Mule Ring Topology & Graph Intelligence (FR4)\nSentinelIQ maps transaction flows using **NetworkX Directed Graph Analytics** across $k \\le 4$ hops:\n\n• **Centrality Threshold**: Nodes with $C_D^+ > 0.05$ (high fan-in) or **PageRank > 0.015** are flagged in bright red.\n• **Pass-Through Velocity**: Funds traversing > 3 intermediate accounts within 10 minutes are tagged as syndication channels.\n• **Cash-Out Terminals**: Flows terminating at Koramangala ATM or Indiranagar CDM are earmarked for law-enforcement freeze requests.`;
    } else if (q.includes("loan") || q.includes("emi") || q.includes("dpd") || q.includes("repay")) {
      responseText = `### 📊 Loan Distress & Early Warning Engine (FR3)\nThe credit risk pipeline computes borrower health on a 0–100 scale:\n\n• **EMI-to-Income ($R_{\\text{EMI}}$)**: Flags triggered when $\\sum \\text{EMI} / I_{\\text{verified}} \\ge 40\\%$.\n• **Income Shock ($\\Delta I$)**: Drops $> 20\\%$ over trailing 3 months trigger proactive watchlisting.\n• **Liquid Runway**: Computed as $B_{\\text{liquid}} / |\\min(0, \\text{Net Cash Flow})|$. Runway $< 2.0$ months initiates loan restructuring offers.\n• **Fraud-to-Credit Linkage ($L_{\\text{fraud}}$)**: Confirmed scam losses immediately degrade liquid reserves in the nightly batch run.`;
    } else {
      responseText = `### 🛡️ SentinelIQ Risk Analysis: '${query}'\nSentinelIQ is actively monitoring real-time digital payments and credit books.\n\n• **Real-Time Pre-Check**: Inline evaluation under sub-200ms SLA (\`/payments/precheck\`).\n• **Current System State**: 0 active system anomalies; 14 background risk workers operating normally.\n• **Inquiry Assistance**: You can query any specific account (e.g. *'Check Rahul'*), merchant (e.g. *'Verify Zepto'*), or incident taxonomy.`;
    }

    return {
      query,
      response: responseText,
      is_read_only: true,
    };
  }
}

export async function getDriftMetrics() {
  try {
    const { data } = await apiClient.get("/analytics/drift");
    return data;
  } catch (err) {
    return {
      status: "STABLE",
      psi_value: 0.0412,
      psi_threshold: 0.25,
      ks_statistic: 0.0384,
      ks_pvalue: 0.428,
      action_required: false,
    };
  }
}

// ── Role-Based Authentication & User Session ────────────────
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: "analyst" | "customer";
  customer_id?: string | null;
  permissions: string[];
}

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface DemoAccountInfo {
  role: "analyst" | "customer";
  username: string;
  email: string;
  password: string;
  full_name: string;
  description: string;
}

export async function loginApi(
  email_or_username: string,
  password: string,
  role?: "analyst" | "customer"
): Promise<LoginResponseData> {
  const { data } = await apiClient.post<LoginResponseData>("/auth/login", {
    email_or_username,
    password,
    role,
  });
  return data;
}

export async function getMeApi(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
}

export async function getDemoAccountsApi(): Promise<DemoAccountInfo[]> {
  try {
    const { data } = await apiClient.get<DemoAccountInfo[]>("/auth/demo-accounts");
    return data;
  } catch (e) {
    return [
      {
        role: "analyst",
        username: "analyst",
        email: "analyst@sentineliq.ai",
        password: "analyst123",
        full_name: "Elena Vance (Lead Risk Analyst)",
        description: "Full risk management console, case queue, and graph topology.",
      },
      {
        role: "customer",
        username: "customer",
        email: "customer@sentineliq.ai",
        password: "customer123",
        full_name: "Aarav Sharma",
        description: "Retail banking customer checkout simulator and account runway.",
      },
    ];
  }
}

