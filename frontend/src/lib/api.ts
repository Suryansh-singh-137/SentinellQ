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

const FALLBACK_CREDIT_MAP: Record<string, CustomerCreditProfile> = {
  "CUST-001": {
    customer_id: "CUST-001", customer_name: "Aarav Sharma", stage: "Stressed",
    verified_monthly_income: 85000, total_emi_obligations: 38500,
    emi_to_income_ratio: 0.453, dpd_worst: "30-60", total_late_3m: 2,
    income_trend: -0.224, spending_spike: 1.35, credit_utilization: 0.835,
    liquid_balance: 14500, runway_months: 2.1, overall_risk_score: 74.5,
    risk_tier: "stressed", late_payment_count: 4, net_cash_flow: -3200,
    repayment_score: 52, cash_runway_months: 2.1, credit_utilization_pct: 83.5,
    spending_spike_flag: true, recent_scam_loss_flag: true, total_scam_loss: 45000,
  },
  "CUST-002": {
    customer_id: "CUST-002", customer_name: "Priya Nair", stage: "Default-risk",
    verified_monthly_income: 62000, total_emi_obligations: 34000,
    emi_to_income_ratio: 0.548, dpd_worst: "60+", total_late_3m: 5,
    income_trend: -0.31, spending_spike: 1.72, credit_utilization: 0.91,
    liquid_balance: 6200, runway_months: 0.9, overall_risk_score: 89.0,
    risk_tier: "default-risk", late_payment_count: 6, net_cash_flow: -8500,
    repayment_score: 28, cash_runway_months: 0.9, credit_utilization_pct: 91,
    spending_spike_flag: true, recent_scam_loss_flag: false, total_scam_loss: 0,
  },
  "CUST-003": {
    customer_id: "CUST-003", customer_name: "Rohan Mehta", stage: "Watch",
    verified_monthly_income: 110000, total_emi_obligations: 42000,
    emi_to_income_ratio: 0.381, dpd_worst: "1-30", total_late_3m: 1,
    income_trend: -0.08, spending_spike: 1.15, credit_utilization: 0.64,
    liquid_balance: 32000, runway_months: 4.5, overall_risk_score: 48.0,
    risk_tier: "watch", late_payment_count: 1, net_cash_flow: 5200,
    repayment_score: 68, cash_runway_months: 4.5, credit_utilization_pct: 64,
    spending_spike_flag: false, recent_scam_loss_flag: false, total_scam_loss: 0,
  },
  "CUST-004": {
    customer_id: "CUST-004", customer_name: "Anjali Rao", stage: "Healthy",
    verified_monthly_income: 145000, total_emi_obligations: 28000,
    emi_to_income_ratio: 0.193, dpd_worst: "0", total_late_3m: 0,
    income_trend: 0.12, spending_spike: 0.95, credit_utilization: 0.38,
    liquid_balance: 89000, runway_months: 12.4, overall_risk_score: 18.0,
    risk_tier: "healthy", late_payment_count: 0, net_cash_flow: 24800,
    repayment_score: 92, cash_runway_months: 12.4, credit_utilization_pct: 38,
    spending_spike_flag: false, recent_scam_loss_flag: false, total_scam_loss: 0,
  },
};
const FALLBACK_CREDIT = FALLBACK_CREDIT_MAP["CUST-001"];

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

export async function getLoanCreditProfile(customerId: string): Promise<CustomerCreditProfile> {
  try {
    const { data } = await apiClient.get<CustomerCreditProfile>(`/loans/${customerId}/credit-profile`);
    return data;
  } catch (err) {
    // Return per-customer fallback if available, otherwise CUST-001 baseline
    return FALLBACK_CREDIT_MAP[customerId] ?? FALLBACK_CREDIT;
  }
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
    return {
      query,
      response: `SentinelIQ Copilot: Analyzed '${query}'. The customer exhibits high anomaly convergence: transaction amount exceeds 8.2x personal baseline during an active call, with payee added 4 minutes ago. Local SHAP attribution indicates amount deviation (+0.38) and voice call urgency (+0.28) as the primary risk contributors.`,
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
