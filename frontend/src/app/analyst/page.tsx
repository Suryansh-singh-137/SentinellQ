"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Activity,
  UserCheck,
  Ban,
  FileText,
  MessageSquare,
  TrendingDown,
  Layers,
  Radio,
  Send,
  Zap,
} from "lucide-react";
import {
  getCases,
  getCaseDetail,
  actOnCase,
  getLoanCreditProfile,
  queryAssistant,
  getDriftMetrics,
  CaseListItem,
  CaseDetail,
  CustomerCreditProfile,
  WS_BASE_URL,
} from "@/lib/api";
import { MuleGraphView } from "@/components/analyst/MuleGraphView";

export default function AnalystDashboardPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "mule_graph" | "credit_risk" | "governance">("queue");

  // Cases Queue State
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [actionNotes, setActionNotes] = useState<string>("");

  // WebSocket Live Alerts State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Credit Profile State
  const [creditProfile, setCreditProfile] = useState<CustomerCreditProfile | null>(null);

  // Drift Metrics State
  const [driftReport, setDriftReport] = useState<any>(null);

  // Read-Only LLM Assistant State
  const [assistantQuery, setAssistantQuery] = useState<string>("");
  const [assistantChat, setAssistantChat] = useState<{ sender: "user" | "assistant"; text: string }[]>([
    {
      sender: "assistant",
      text: "Hello, Analyst. I am the read-only SentinelIQ assistant. Ask me questions about flagged cases, scam patterns, or loan risk dynamics.",
    },
  ]);
  const [assistantLoading, setAssistantLoading] = useState<boolean>(false);

  // 1. Initial Load
  useEffect(() => {
    loadCases();
    loadCreditProfile();
    loadDrift();
    initWebSocket();
  }, []);

  const loadCases = async () => {
    setLoadingCases(true);
    try {
      const res = await getCases();
      setCases(res.cases);
      if (res.cases.length > 0 && !selectedCase) {
        loadCaseDetail(res.cases[0].id);
      }
    } catch (e) {
      console.error("Failed to load cases:", e);
    } finally {
      setLoadingCases(false);
    }
  };

  const loadCaseDetail = async (caseId: string) => {
    try {
      const detail = await getCaseDetail(caseId);
      setSelectedCase(detail);
    } catch (e) {
      console.error("Failed to load case detail:", e);
    }
  };

  const loadCreditProfile = async () => {
    try {
      const data = await getLoanCreditProfile("CUST-001");
      setCreditProfile(data);
    } catch (e) {
      console.error("Failed to load credit profile:", e);
    }
  };

  const loadDrift = async () => {
    try {
      const data = await getDriftMetrics();
      setDriftReport(data);
    } catch (e) {
      console.error("Failed to load drift:", e);
    }
  };

  // 2. WebSocket Connection for Live Threat Feeds
  const initWebSocket = () => {
    try {
      const ws = new WebSocket(WS_BASE_URL);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          setAlerts((prev) => [payload, ...prev.slice(0, 9)]);
          // Auto refresh cases queue
          loadCases();
        } catch (err) {}
      };
    } catch (e) {
      console.error("WebSocket init error:", e);
    }
  };

  // 3. Case Action Handling
  const handleCaseAction = async (action: "approve" | "block" | "restructure") => {
    if (!selectedCase) return;
    try {
      await actOnCase(selectedCase.id, action, actionNotes || undefined);
      setActionNotes("");
      await loadCases();
      await loadCaseDetail(selectedCase.id);
    } catch (e: any) {
      alert("Action failed: " + e.message);
    }
  };

  // 4. LLM Assistant Query
  const handleSendAssistant = async () => {
    if (!assistantQuery.trim()) return;
    const q = assistantQuery;
    setAssistantChat((prev) => [...prev, { sender: "user", text: q }]);
    setAssistantQuery("");
    setAssistantLoading(true);

    try {
      const res = await queryAssistant(q, selectedCase?.id);
      setAssistantChat((prev) => [...prev, { sender: "assistant", text: res.response }]);
    } catch (e: any) {
      setAssistantChat((prev) => [
        ...prev,
        { sender: "assistant", text: "Error contacting assistant API. Please check backend status." },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2430]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[#586071] hover:text-[#1F2430] flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#435278]" />
            <h1 className="font-bold text-lg text-[#1F2430]">SentinelIQ Enterprise Analyst Suite</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2 text-xs bg-[#F3F4F6] px-3 py-1.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#DC2626]"}`} />
            <span className="text-[#4B5563] font-medium">{wsConnected ? "WebSocket Live (/ws/alerts)" : "WS Disconnected"}</span>
          </div>
          <Link
            href="/shop"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#4B5563] font-medium hover:bg-[#E5E7EB]"
          >
            Open /shop Checkout Interceptor
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Real-Time Alert Ticker (if alerts exist) */}
        {alerts.length > 0 && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 flex items-center justify-between text-xs text-[#991B1B]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-ping text-[#DC2626]" />
              <span className="font-bold uppercase">LIVE THREAT BROADCAST:</span>
              <span>
                Transaction <code className="font-mono">{alerts[0].transaction_id}</code> (₹{alerts[0].amount?.toLocaleString()}) BLOCKED — Score {alerts[0].fraud_score}/100.
              </span>
            </div>
            <span className="text-[11px] text-[#DC2626]/70">Ingested to Priority Queue</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "queue" ? "bg-[#435278] text-white shadow-xs" : "text-[#586071] hover:bg-[#E5E7EB]"
            }`}
          >
            📋 Priority Investigation Queue (FR4)
          </button>
          <button
            onClick={() => setActiveTab("mule_graph")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "mule_graph" ? "bg-[#435278] text-white shadow-xs" : "text-[#586071] hover:bg-[#E5E7EB]"
            }`}
          >
            🕸️ Mule-Ring Graph Topology (FR4)
          </button>
          <button
            onClick={() => setActiveTab("credit_risk")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "credit_risk" ? "bg-[#435278] text-white shadow-xs" : "text-[#586071] hover:bg-[#E5E7EB]"
            }`}
          >
            📊 Loan Distress & Early Warning (FR3)
          </button>
          <button
            onClick={() => setActiveTab("governance")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "governance" ? "bg-[#435278] text-white shadow-xs" : "text-[#586071] hover:bg-[#E5E7EB]"
            }`}
          >
            ⚖️ Governance & Model Drift (FR5)
          </button>
        </div>

        {/* Tab 1: Priority Queue & Investigation Details */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Queue List (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F5]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Ranked Priority Queue ({cases.length})
                </h2>
                <span className="text-[11px] text-[#6B7280]">Order: Score × Amt × log10(Exposure)</span>
              </div>

              {loadingCases ? (
                <div className="p-8 text-center text-xs text-[#9CA3AF]">Loading cases...</div>
              ) : cases.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#9CA3AF]">No active cases in queue</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {cases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => loadCaseDetail(c.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedCase?.id === c.id
                          ? "bg-[#EEF2F6] border-[#435278] shadow-xs"
                          : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1F2430]">{c.customer_name || c.id}</span>
                        <span className="font-mono text-[11px] bg-[#FEF2F2] text-[#DC2626] font-semibold px-2 py-0.5 rounded">
                          Priority: {c.priority_score.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[#4B5563]">
                        <span>Txn: ₹{c.transaction_amount.toLocaleString()}</span>
                        <span
                          className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                            c.status === "approved"
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : c.status === "blocked"
                              ? "bg-[#FEE2E2] text-[#991B1B]"
                              : "bg-[#FEF3C7] text-[#92400E]"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-[#6B7280] truncate">
                        {c.primary_scam_type ? `Scam: ${c.primary_scam_type}` : c.case_type} · Risk: {c.risk_score}/100
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Investigation View (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-5">
              {selectedCase ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[#1F2430]">Case: {selectedCase.id}</h2>
                        <span className="text-xs bg-[#EEF2F6] text-[#435278] font-bold px-2 py-0.5 rounded">
                          {selectedCase.case_type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#586071] mt-0.5">
                        Customer: <span className="font-semibold text-[#1F2430]">{selectedCase.customer_name}</span> ({selectedCase.customer_id})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#DC2626]">{selectedCase.risk_score}/100</div>
                      <span className="text-[10px] font-semibold text-[#6B7280] uppercase">Calculated Risk Score</span>
                    </div>
                  </div>

                  {/* Quantitative Exposure metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]">
                      <span className="text-[10px] uppercase text-[#6B7280] block font-semibold">Transaction Amount</span>
                      <span className="text-sm font-bold text-[#1F2430]">₹{selectedCase.transaction_amount.toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]">
                      <span className="text-[10px] uppercase text-[#6B7280] block font-semibold">Total Exposure</span>
                      <span className="text-sm font-bold text-[#1F2430]">₹{selectedCase.total_exposure.toLocaleString()}</span>
                    </div>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]">
                      <span className="text-[10px] uppercase text-[#6B7280] block font-semibold">Priority Rank Score</span>
                      <span className="text-sm font-bold text-[#DC2626]">{selectedCase.priority_score.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Plain-English Explainability Reason Codes */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-2">
                      RBI Explainability Reason Codes (SHAP Vectors)
                    </h3>
                    <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1.5">
                      {selectedCase.reason_codes.map((r, i) => (
                        <div key={i} className="text-xs text-[#4B5563] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SHAP Feature Contribution Vector */}
                  {selectedCase.shap_values && Object.keys(selectedCase.shap_values).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-2">
                        Local SHAP Feature Attribution
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(selectedCase.shap_values).map(([k, v]: [string, any]) => (
                          <div key={k} className="p-2 bg-[#F8F9FA] rounded-lg border border-[#E5E7EB] flex justify-between">
                            <span className="text-[#6B7280]">{k.replace("_", " ")}</span>
                            <span className={`font-mono font-bold ${v > 0 ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                              {v > 0 ? `+${v}` : v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analyst Action Buttons */}
                  <div className="pt-4 border-t border-[#F1F3F5] space-y-3">
                    <input
                      type="text"
                      placeholder="Add analyst investigation notes (e.g. 'Customer confirmed via step-up callback')..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-xs"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCaseAction("approve")}
                        className="flex-1 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Approve / Clear
                      </button>
                      <button
                        onClick={() => handleCaseAction("block")}
                        className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Ban className="w-3.5 h-3.5" /> Block / Flag
                      </button>
                      <button
                        onClick={() => handleCaseAction("restructure")}
                        className="flex-1 py-2.5 rounded-xl bg-[#435278] hover:bg-[#344161] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <TrendingDown className="w-3.5 h-3.5" /> Proactive Restructure
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-xs text-[#9CA3AF]">Select a case from the queue to investigate</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Mule Ring Topology */}
        {activeTab === "mule_graph" && <MuleGraphView />}

        {/* Tab 3: Loan Distress & Early Warning Engine (FR3) */}
        {activeTab === "credit_risk" && creditProfile && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
              <div>
                <span className="text-xs uppercase font-semibold text-[#435278] bg-[#EEF2F6] px-2.5 py-1 rounded-full">
                  FR3 Mathematical Formulations
                </span>
                <h2 className="text-xl font-bold text-[#1F2430] mt-2">Loan Repayment Risk & Early Warning Engine</h2>
                <p className="text-xs text-[#586071]">
                  Quantitative credit distress monitoring calculated per customer across active loan obligations.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#D97706]">{creditProfile.overall_risk_score}/100</div>
                <span className="text-[11px] font-bold uppercase text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  Tier: {creditProfile.risk_tier}
                </span>
              </div>
            </div>

            {/* Formula Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">EMI-to-Income Ratio (R_EMI)</span>
                <div className="text-lg font-bold text-[#DC2626]">
                  {(creditProfile.emi_to_income_ratio * 100).toFixed(1)}%
                </div>
                <p className="text-[11px] text-[#6B7280]">Formula: sum(EMI) / I_verified. Threshold &ge; 40% triggers flag.</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Days Past Due (DPD) Bucket</span>
                <div className="text-lg font-bold text-[#D97706]">DPD {creditProfile.dpd_worst}</div>
                <p className="text-[11px] text-[#6B7280]">States: DPD 0, 1-30, 30-60, 60+</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Income Trend Dynamics (ΔI)</span>
                <div className="text-lg font-bold text-[#DC2626]">
                  {(creditProfile.income_trend * 100).toFixed(1)}% Drop
                </div>
                <p className="text-[11px] text-[#6B7280]">Formula: (I_trail3m - I_current) / I_trail3m. Trigger &gt; 20%.</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Liquid Cash Runway</span>
                <div className="text-lg font-bold text-[#16A34A]">{creditProfile.runway_months} Months</div>
                <p className="text-[11px] text-[#6B7280]">Formula: B_liquid / (|min(0, Net Cash Flow)| + ε)</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Credit Line Utilization</span>
                <div className="text-lg font-bold text-[#DC2626]">
                  {(creditProfile.credit_utilization * 100).toFixed(1)}%
                </div>
                <p className="text-[11px] text-[#6B7280]">Formula: Balance / Limit</p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Late Payment Velocity (3m)</span>
                <div className="text-lg font-bold text-[#374151]">{creditProfile.total_late_3m} Incidents</div>
                <p className="text-[11px] text-[#6B7280]">Delayed or partial EMI count over trailing window</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Governance & Drift Monitoring (FR5) */}
        {activeTab === "governance" && driftReport && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
              <div>
                <span className="text-xs uppercase font-semibold text-[#435278] bg-[#EEF2F6] px-2.5 py-1 rounded-full">
                  FR5 Continuous Model Governance
                </span>
                <h2 className="text-xl font-bold text-[#1F2430] mt-2">Quantitative Distribution Drift Monitoring</h2>
                <p className="text-xs text-[#586071]">
                  Evaluates Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) test between baseline and shadow models.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534]">
                  STATUS: {driftReport.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-2">
                <span className="text-xs font-bold uppercase text-[#6B7280]">Population Stability Index (PSI)</span>
                <div className="text-2xl font-bold text-[#1F2430]">{driftReport.psi_value}</div>
                <p className="text-xs text-[#586071]">
                  Threshold: <code className="font-bold">&gt; {driftReport.psi_threshold}</code> flags significant distribution drift and halts automated shadow promotion.
                </p>
              </div>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] space-y-2">
                <span className="text-xs font-bold uppercase text-[#6B7280]">Kolmogorov-Smirnov (KS) Test</span>
                <div className="text-2xl font-bold text-[#1F2430]">p-val: {driftReport.ks_pvalue.toFixed(4)}</div>
                <p className="text-xs text-[#586071]">
                  KS Statistic: <span className="font-mono">{driftReport.ks_statistic}</span>. Significance <code className="font-bold">p &lt; 0.05</code> triggers manual model review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Read-Only LLM Assistant Widget (FR4) */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F5]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#435278]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2430]">
                Read-Only LLM Conversational Assistant (FR4)
              </h3>
            </div>
            <span className="text-[10px] bg-[#EEF2F6] text-[#435278] font-semibold px-2 py-0.5 rounded">
              Read-Only Safety Guardrail Enforced
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {assistantChat.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl text-xs max-w-2xl ${
                  msg.sender === "user"
                    ? "ml-auto bg-[#435278] text-white"
                    : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#374151]"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#F1F3F5]">
            <input
              type="text"
              placeholder="Ask contextual questions (e.g. 'Why was this case flagged?' or 'Explain mule ring hops')..."
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendAssistant()}
              className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded-lg text-xs"
            />
            <button
              onClick={handleSendAssistant}
              disabled={assistantLoading}
              className="px-4 py-2 bg-[#435278] hover:bg-[#344161] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3 h-3" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
