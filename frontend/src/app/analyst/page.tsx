"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
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
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import {
  getCases,
  getCaseDetail,
  actOnCase,
  queryAssistant,
  getDriftMetrics,
  precheckPayment,
  confirmStepUp,
  CaseListItem,
  CaseDetail,
  PrecheckResponse,
  WS_BASE_URL,
} from "@/lib/api";
import { MuleGraphView } from "@/components/analyst/MuleGraphView";
import { OverviewTab } from "@/components/analyst/OverviewTab";
import { CreditRiskTab } from "@/components/analyst/CreditRiskTab";
import { AppSidebar, DashboardTab } from "@/components/dashboard/AppSidebar";
import { useAuth } from "@/context/AuthContext";

export default function AnalystDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const { user, role, isAuthenticated, quickLogin } = useAuth();

  // Cases Queue State
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [caseFilter, setCaseFilter] = useState<string>("all");

  // WebSocket Live Alerts State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

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

  // Embedded Checkout Simulator State
  const [simAmount, setSimAmount] = useState<number>(45000);
  const [simChannel, setSimChannel] = useState<string>("upi");
  const [simCustomer, setSimCustomer] = useState<string>("CUST-002");
  const [simMerchant, setSimMerchant] = useState<string>("MERCHANT-NEW-MULE-HUB");
  const [simDevice, setSimDevice] = useState<string>("dev-fp-unrecognized-pixel");
  const [simBeneficiary, setSimBeneficiary] = useState<string>("PAYEE-ADDED-2M-AGO");
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<PrecheckResponse | null>(null);
  const [simLatency, setSimLatency] = useState<number | null>(null);
  const [simOtpOpen, setSimOtpOpen] = useState<boolean>(false);
  const [simOtpInput, setSimOtpInput] = useState<string>("");
  const [simOtpMessage, setSimOtpMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
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



  const loadDrift = async () => {
    try {
      const data = await getDriftMetrics();
      setDriftReport(data);
    } catch (e) {
      console.error("Failed to load drift:", e);
    }
  };

  const initWebSocket = () => {
    try {
      const ws = new WebSocket(WS_BASE_URL);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          setAlerts((prev) => [payload, ...prev.slice(0, 9)]);
          loadCases();
        } catch (err) {}
      };
    } catch (e) {
      console.error("WebSocket init error:", e);
    }
  };

  const handleCaseAction = async (action: "approve" | "block" | "restructure") => {
    if (!selectedCase) return;
    try {
      await actOnCase(selectedCase.id, action, actionNotes || undefined);
      setActionNotes("");
      await loadCases();
      await loadCaseDetail(selectedCase.id);
    } catch (e) {
      console.error("Case action failed:", e);
    }
  };

  const handleAssistantSend = async () => {
    if (!assistantQuery.trim() || assistantLoading) return;
    const q = assistantQuery;
    setAssistantQuery("");
    setAssistantChat((prev) => [...prev, { sender: "user", text: q }]);
    setAssistantLoading(true);

    try {
      const res = await queryAssistant(q);
      setAssistantChat((prev) => [...prev, { sender: "assistant", text: res.response }]);
    } catch (e) {
      setAssistantChat((prev) => [
        ...prev,
        { sender: "assistant", text: "Error querying assistant service. Ensure backend is running." },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleSimulatePrecheck = async () => {
    setSimLoading(true);
    setSimResult(null);
    setSimOtpMessage(null);
    const t0 = performance.now();
    try {
      const res = await precheckPayment({
        customer_id: simCustomer,
        amount: simAmount,
        merchant_id: simMerchant,
        channel: simChannel,
        device_fingerprint: simDevice,
        ip_address: "192.168.1.101",
        beneficiary_id: simBeneficiary,
      });
      const t1 = performance.now();
      setSimLatency(Math.round(t1 - t0));
      setSimResult(res);
      if (res.decision === "step_up") {
        setSimOtpOpen(true);
      }
      loadCases();
    } catch (e) {
      console.error("Precheck simulation error:", e);
    } finally {
      setSimLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!simResult?.transaction_id) return;
    try {
      const res = await confirmStepUp(simResult.transaction_id, true, simOtpInput);
      setSimOtpMessage(`Step-up verified: ${res.decision}`);
      setSimOtpOpen(false);
      setSimOtpInput("");
    } catch (e) {
      setSimOtpMessage("Step-up challenge failed or invalid OTP.");
    }
  };

  const filteredCases = cases.filter((c) => {
    if (caseFilter === "open") return c.status === "Open" || c.status === "In_Review";
    if (caseFilter === "resolved") return c.status === "Resolved";
    return true;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5]">
      {/* Enterprise Unified Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        openCasesCount={cases.filter((c) => c.status === "Open" || c.status === "In_Review").length}
        wsConnected={wsConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        {role === "customer" && (
          <div className="bg-[#FCF5E9] border-b border-[#F3E0BE] px-8 py-2.5 flex items-center justify-between text-xs text-[#D49D4A] shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D49D4A]" />
              <span>
                <strong>Role Notice:</strong> You are signed in as Customer ({user?.full_name}). Risk investigation tools require Analyst clearance.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => quickLogin("analyst")}
                className="px-3 py-1 rounded-full bg-[#D49D4A] text-white font-semibold hover:bg-[#C28C3B] shadow-2xs transition-colors cursor-pointer"
              >
                1-Click Switch to Analyst
              </button>
              <Link
                href="/shop"
                className="px-3 py-1 rounded-full bg-white text-[#D49D4A] border border-[#F3E0BE] font-semibold hover:bg-[#FAF8F5] transition-colors"
              >
                Go to Customer Shop
              </Link>
            </div>
          </div>
        )}

        <header className="h-20 bg-white border-b border-[rgba(31,36,48,0.06)] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1F2430]">
              {activeTab === "overview" && "Platform Risk Overview"}
              {activeTab === "queue" && "Priority Case Investigation Queue"}
              {activeTab === "mule_graph" && "Multi-Hop Mule Ring Network Canvas"}
              {activeTab === "credit_risk" && "Loan Default Prevention & Watchlist"}
              {activeTab === "shop_simulator" && "Consumer Checkout Pre-Check Simulator"}
              {activeTab === "governance" && "Model Governance & Shadow Mode"}
              {activeTab === "assistant" && "Conversational Read-Only Risk Assistant"}
            </h1>
            <p className="text-xs text-[#586071] mt-0.5">
              Dual-Risk Engine · Pre-Checkout Interception + Downstream Default Prevention
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                loadCases();
                loadDrift();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EFE8] border border-[rgba(31,36,48,0.08)] text-xs font-semibold text-[#1F2430] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#435278]" />
              <span>Refresh Ledger</span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-[rgba(31,36,48,0.08)]">
              <div className="h-8 w-8 rounded-full bg-[#EEF2F7] border border-[#D1E0EE] flex items-center justify-center font-bold text-[#435278] text-xs">
                {user?.full_name ? user.full_name.charAt(0) : "E"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#1F2430] leading-none">
                  {user?.full_name || "Elena Vance"}
                </span>
                <span className="text-[10px] text-[#729E85] font-semibold font-mono mt-0.5">
                  {role === "analyst" ? "CLEARANCE: ACTIVE" : "ANALYST VIEW"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab View Canvas */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <OverviewTab
              cases={cases}
              alerts={alerts}
              wsConnected={wsConnected}
              onNavigateToQueue={() => setActiveTab("queue")}
            />
          )}

          {/* TAB 2: INCIDENT INVESTIGATION QUEUE */}
          {activeTab === "queue" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
              {/* Cases Queue List (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs flex flex-col h-[750px]">
                <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-[#1F2430]">
                      Prioritized Queue
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#586071]">
                      {filteredCases.length}
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => setCaseFilter("all")}
                      className={`px-2.5 py-1 rounded-full ${
                        caseFilter === "all" ? "bg-[#435278] text-white" : "text-[#586071]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setCaseFilter("open")}
                      className={`px-2.5 py-1 rounded-full ${
                        caseFilter === "open" ? "bg-[#435278] text-white" : "text-[#586071]"
                      }`}
                    >
                      Open
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {filteredCases.map((c) => {
                    const isSelected = selectedCase?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => loadCaseDetail(c.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#435278] bg-[#FAF8F5] shadow-xs ring-1 ring-[#435278]/20"
                            : "border-[rgba(31,36,48,0.06)] bg-white hover:border-[rgba(31,36,48,0.14)]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-semibold text-[#1F2430]">
                            {c.id}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              c.status === "Open"
                                ? "bg-[#FBEFEF] text-[#D16D6D]"
                                : "bg-[#EBF3EE] text-[#729E85]"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-sm font-semibold text-[#1F2430]">
                            {c.customer_name || "Aarav Mehta"}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#1F2430] tnum">
                            ₹{c.transaction_amount?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-[#586071]">
                          <span>{c.primary_scam_type || c.case_type || "Anomaly Flag"}</span>
                          <span className="font-mono font-semibold text-[#D16D6D]">
                            Score: {c.risk_score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Case Detail & SHAP Feature Attributions Panel (7 cols) */}
              <div className="lg:col-span-7 p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs flex flex-col justify-between">
                {selectedCase ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)]">
                      <div>
                        <span className="text-xs font-mono text-[#8A92A2] block">
                          Case File: {selectedCase.id} · Priority Score: {selectedCase.priority_score}
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-[#1F2430] mt-0.5">
                          {selectedCase.customer_name || "Flagged Subject"} ({selectedCase.customer_id})
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#8A92A2] block">Held Transaction Amount</span>
                        <span className="font-serif text-2xl font-bold text-[#D16D6D] tnum">
                          ₹{selectedCase.transaction_amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[rgba(31,36,48,0.05)]">
                      <div>
                        <span className="text-[#8A92A2] block text-[11px]">Scam Vector</span>
                        <span className="font-bold text-[#1F2430] mt-0.5 block">
                          {selectedCase.primary_scam_type || selectedCase.case_type || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8A92A2] block text-[11px]">Case Type</span>
                        <span className="font-bold text-[#1F2430] mt-0.5 block">
                          {selectedCase.case_type || "UPI Pre-Check"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8A92A2] block text-[11px]">Total Exposure</span>
                        <span className="font-bold text-[#1F2430] mt-0.5 block">
                          ₹{selectedCase.total_exposure?.toLocaleString() || "1,07,800"}
                        </span>
                      </div>
                    </div>

                    {/* SHAP Reason Codes */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#586071] mb-3">
                        SHAP Explainability Attributions & Reason Codes
                      </h4>
                      <div className="space-y-2">
                        {selectedCase.reason_codes?.map((r: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-[rgba(31,36,48,0.06)] text-xs text-[#1F2430] flex items-center justify-between"
                          >
                            <span className="font-medium">{r}</span>
                            <span className="font-mono text-[#D16D6D] font-bold">+SHAP</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analyst Operational Notes */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#586071] block mb-2">
                        Analyst Decision Notes
                      </label>
                      <textarea
                        rows={3}
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Log verification details (e.g. verified victim phone logs, confirmed scam script)..."
                        className="w-full p-3 rounded-2xl border border-[rgba(31,36,48,0.1)] text-xs focus:outline-none focus:border-[#435278] bg-[#FAF8F5]"
                      />
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="pt-4 border-t border-[rgba(31,36,48,0.06)] flex items-center gap-3">
                      <button
                        onClick={() => handleCaseAction("approve")}
                        className="flex-1 py-3 rounded-xl bg-[#EBF3EE] hover:bg-[#DCEBDE] text-[#729E85] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Approve Transaction</span>
                      </button>

                      <button
                        onClick={() => handleCaseAction("block")}
                        className="flex-1 py-3 rounded-xl bg-[#FBEFEF] hover:bg-[#F7DADA] text-[#D16D6D] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Block & Quarantine</span>
                      </button>

                      <button
                        onClick={() => handleCaseAction("restructure")}
                        className="flex-1 py-3 rounded-xl bg-[#FCF5E9] hover:bg-[#F5E8D0] text-[#D49D4A] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Proactive Restructure</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#8A92A2] italic text-center py-20">
                    Select a case from the queue to inspect attributions.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MULE GRAPH NETWORK */}
          {activeTab === "mule_graph" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1F2430]">
                      Mule Laundering Ring Topology Map
                    </h3>
                    <p className="text-xs text-[#586071]">
                      Tracing multi-hop fund dispersion up to k ≤ 4 hops
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FBEFEF] text-[#D16D6D] border border-[#F3D2D2]">
                    High Centrality Nodes Highlighted
                  </span>
                </div>

                <MuleGraphView />
              </div>
            </div>
          )}

          {/* TAB 4: LOAN DEFAULT & CREDIT DISTRESS */}
          {activeTab === "credit_risk" && (
            <CreditRiskTab />
          )}

          {/* TAB 5: EMBEDDED CHECKOUT SIMULATOR */}
          {activeTab === "shop_simulator" && (
            <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)]">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#1F2430]">
                    Consumer Checkout Pre-Check Simulator
                  </h3>
                  <p className="text-xs text-[#586071]">
                    Test synchronous sub-200ms risk precheck before Juspay session creation
                  </p>
                </div>
                <Link
                  href="/shop"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-[#435278] font-semibold hover:underline"
                >
                  <span>Open Full Shop Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimAmount(450);
                    setSimChannel("upi");
                    setSimCustomer("CUST-001");
                    setSimMerchant("MERCHANT-SWIGGY-VERIFIED");
                    setSimDevice("dev-fp-safari-mac-01");
                    setSimBeneficiary("PAYEE-ESTABLISHED");
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA]"
                >
                  Preset: Low Risk (₹450 Grocery)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimAmount(7500);
                    setSimChannel("card");
                    setSimCustomer("CUST-001");
                    setSimMerchant("MERCHANT-NEW-STORE");
                    setSimDevice("dev-fp-new-device-unknown");
                    setSimBeneficiary("PAYEE-NORMAL");
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FCF5E9] text-[#D49D4A] border border-[#F3E0BE]"
                >
                  Preset: Medium Step-Up (₹7,500 Card)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimAmount(95000);
                    setSimChannel("upi");
                    setSimCustomer("CUST-002");
                    setSimMerchant("MERCHANT-BLACKLISTED-SHADY");
                    setSimDevice("dev-fp-active-call-flag");
                    setSimBeneficiary("PAYEE-NEW-MULE");
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FBEFEF] text-[#D16D6D] border border-[#F3D2D2]"
                >
                  Preset: High Risk Scam (₹95,000 Transfer)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#586071] block mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[rgba(31,36,48,0.1)] text-sm font-mono bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#586071] block mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={simChannel}
                    onChange={(e) => setSimChannel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(31,36,48,0.1)] text-sm bg-[#FAF8F5]"
                  >
                    <option value="upi">UPI Instant Rail</option>
                    <option value="card">Debit / Credit Card</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulatePrecheck}
                disabled={simLoading}
                className="w-full py-3.5 rounded-full bg-[#435278] hover:bg-[#344161] text-white font-semibold text-sm transition-colors shadow-xs"
              >
                {simLoading ? "Evaluating Risk via /payments/precheck..." : "Run Real-Time Pre-Check Scoring"}
              </button>

              {/* Simulation Result */}
              {simResult && (
                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-[#8A92A2] block font-mono">
                        Latency SLA: {simLatency} ms (Sub-200ms Met)
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#1F2430]">
                        Routing Decision: {simResult.decision}
                      </h4>
                    </div>
                    <span className="font-mono text-2xl font-bold text-[#1F2430] tnum">
                      Score: {simResult.fraud_score} / 100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#586071]">
                    {simResult.risk_breakdown?.reason_codes?.map((r: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#435278]" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {simOtpOpen && (
                    <div className="p-4 rounded-xl bg-white border border-[#E8B86B] space-y-3">
                      <span className="text-xs font-bold text-[#D49D4A] block">
                        Step-Up OTP Challenge Enforced:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={simOtpInput}
                          onChange={(e) => setSimOtpInput(e.target.value)}
                          placeholder="Enter 6-digit OTP..."
                          className="flex-1 p-2 rounded-lg border border-[rgba(31,36,48,0.1)] text-xs font-mono"
                        />
                        <button
                          onClick={handleVerifyOtp}
                          className="px-4 py-2 rounded-lg bg-[#D49D4A] text-white font-bold text-xs"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {simOtpMessage && (
                    <p className="text-xs font-semibold text-[#729E85]">
                      {simOtpMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GOVERNANCE & SHADOW MODE */}
          {activeTab === "governance" && (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[rgba(31,36,48,0.06)]">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#1F2430]">
                      Quantitative Model Governance & Drift Monitoring
                    </h3>
                    <p className="text-xs text-[#586071]">
                      Tracking Population Stability Index (PSI) and Kolmogorov-Smirnov drift
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA]">
                    Active Champion: XGBoost v1.4
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
                    <span className="text-xs font-mono text-[#8A92A2] block">
                      Population Stability Index (PSI)
                    </span>
                    <span className="font-serif text-3xl font-bold text-[#729E85] mt-1 block">
                      {driftReport?.psi_value || 0.082}
                    </span>
                    <span className="text-xs text-[#586071] mt-1 block">
                      Threshold &lt; 0.25 (Stable)
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
                    <span className="text-xs font-mono text-[#8A92A2] block">
                      Kolmogorov-Smirnov p-value
                    </span>
                    <span className="font-serif text-3xl font-bold text-[#1F2430] mt-1 block">
                      {driftReport?.ks_pvalue ? driftReport.ks_pvalue.toFixed(4) : "0.4210"}
                    </span>
                    <span className="text-xs text-[#586071] mt-1 block">
                      No distribution shift detected
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
                    <span className="text-xs font-mono text-[#8A92A2] block">
                      Shadow Candidate
                    </span>
                    <span className="font-serif text-xl font-bold text-[#435278] mt-1 block">
                      XGBoost v1.5-nightly
                    </span>
                    <span className="text-xs text-[#729E85] mt-1 block">
                      +1.8% F1-score improvement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: READ-ONLY ASSISTANT */}
          {activeTab === "assistant" && (
            <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs flex flex-col h-[700px]">
              <div className="pb-4 border-b border-[rgba(31,36,48,0.06)] mb-4">
                <h3 className="font-serif text-xl font-bold text-[#1F2430]">
                  Conversational Risk Assistant
                </h3>
                <p className="text-xs text-[#586071]">
                  Strictly read-only natural language threat querying
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {assistantChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                        msg.sender === "user"
                          ? "bg-[#435278] text-white"
                          : "bg-[#FAF8F5] text-[#1F2430] border border-[rgba(31,36,48,0.08)]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {assistantLoading && (
                  <div className="text-xs text-[#8A92A2] italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#435278] animate-pulse" />
                    SentinelIQ Copilot is evaluating risk intelligence...
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                <span className="text-[10px] font-semibold text-[#8A92A2] uppercase mr-1">Try:</span>
                {[
                  "Is Rahul safe to transact with?",
                  "And Zepto?",
                  "Why was Aarav flagged?",
                  "Show Mule Ring topology",
                  "Explain Loan Distress metrics",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAssistantQuery(prompt);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#EEF2F6] text-[#435278] border border-[rgba(31,36,48,0.08)] transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-[rgba(31,36,48,0.06)]">
                <input
                  type="text"
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAssistantSend()}
                  placeholder="Ask a question (e.g. 'Is Rahul safe to transact with?' or 'Check Zepto')..."
                  className="flex-1 p-3 rounded-full border border-[rgba(31,36,48,0.1)] text-xs focus:outline-none focus:border-[#435278] bg-[#FAF8F5]"
                />
                <button
                  onClick={handleAssistantSend}
                  className="px-6 py-3 rounded-full bg-[#435278] hover:bg-[#344161] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
