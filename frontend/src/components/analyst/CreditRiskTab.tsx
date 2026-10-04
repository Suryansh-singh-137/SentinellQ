"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Search,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Percent,
  Calendar,
  Layers,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import {
  getLoanCreditProfile,
  getCustomerList,
  restructureLoan,
  CustomerCreditProfile,
  CustomerPreset,
} from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const FALLBACK_PRESETS: CustomerPreset[] = [
  { id: "CUST-001", name: "Aarav Pai", stage: "Stressed", label: "Aarav Pai (Stressed)" },
  { id: "CUST-002", name: "Qasim Chhabra", stage: "Default-risk", label: "Qasim Chhabra (High Risk)" },
  { id: "CUST-003", name: "Madhav Das", stage: "Watch", label: "Madhav Das (Watch)" },
  { id: "CUST-004", name: "Lila Sagar", stage: "Healthy", label: "Lila Sagar (Healthy)" },
];

function getDPDColor(dpd: string | undefined): string {
  if (!dpd) return "#1F2430";
  if (dpd === "0") return "#729E85";
  if (dpd === "1-30") return "#D49D4A";
  if (dpd === "30-60") return "#D16D6D";
  return "#991B1B";
}

function getEMIRatioColor(ratio: number): string {
  if (ratio < 0.35) return "#729E85";
  if (ratio < 0.45) return "#D49D4A";
  return "#D16D6D";
}

// ─────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  valueColor = "#1F2430",
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueColor?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] flex flex-col justify-between transition-all hover:border-[rgba(31,36,48,0.14)]">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono text-[#8A92A2] uppercase tracking-wider block">{label}</span>
          {Icon && <Icon className="w-3.5 h-3.5 text-[#8A92A2]" />}
        </div>
        <span className="font-serif text-2xl font-bold mt-1 block" style={{ color: valueColor }}>
          {value}
        </span>
      </div>
      {sub && <span className="text-[11px] text-[#8A92A2] mt-1.5 block font-medium">{sub}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Risk Indicator Badge
// ─────────────────────────────────────────────
function RiskBadge({ stage }: { stage: string | undefined }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    Healthy: { bg: "#EBF3EE", text: "#729E85", label: "Healthy" },
    Watch: { bg: "#FCF5E9", text: "#D49D4A", label: "Watch" },
    Stressed: { bg: "#FBEFEF", text: "#D16D6D", label: "Stressed" },
    "Default-risk": { bg: "#FEE2E2", text: "#991B1B", label: "Default Risk" },
  };
  const style = map[stage ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280", label: stage ?? "Unknown" };
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full border border-black/5 inline-flex items-center gap-1.5"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.text }} />
      {style.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main CreditRiskTab
// ─────────────────────────────────────────────

export function CreditRiskTab() {
  const [customerId, setCustomerId] = useState("CUST-001");
  const [inputId, setInputId] = useState("CUST-001");
  const [profile, setProfile] = useState<CustomerCreditProfile | null>(null);
  const [presets, setPresets] = useState<CustomerPreset[]>(FALLBACK_PRESETS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restructuring states
  const [restructuring, setRestructuring] = useState(false);
  const [restructureResult, setRestructureResult] = useState<string | null>(null);

  // Fetch preset customers from backend
  useEffect(() => {
    async function fetchPresets() {
      try {
        const list = await getCustomerList();
        if (list && list.length > 0) {
          setPresets(list);
        }
      } catch (e) {
        console.error("Failed to load customer presets:", e);
      }
    }
    fetchPresets();
  }, []);

  const loadProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setRestructureResult(null);
    try {
      const data = await getLoanCreditProfile(id);
      setProfile(data);
      setCustomerId(data.customer_id || id);
      setInputId(data.customer_id || id);
    } catch {
      setError(`Could not load profile for '${id}'. Ensure backend is running.`);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial profile on mount
  useEffect(() => {
    loadProfile("CUST-001");
  }, [loadProfile]);

  // Real backend restructuring execution
  const handleRestructure = async () => {
    if (!profile) return;
    setRestructuring(true);
    setError(null);
    try {
      const extMonths = profile.suggested_tenure_extension_months || 12;
      const res = await restructureLoan(customerId, extMonths);
      if (res.success) {
        setProfile(res.profile);
        setRestructureResult(res.message);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to execute restructure offer.");
    } finally {
      setRestructuring(false);
    }
  };

  const emiTrend = profile?.emi_trend_history && profile.emi_trend_history.length > 0
    ? profile.emi_trend_history
    : [
        { month: "6m ago", ratio: 0.32 },
        { month: "5m ago", ratio: 0.34 },
        { month: "4m ago", ratio: 0.36 },
        { month: "3m ago", ratio: 0.38 },
        { month: "2m ago", ratio: 0.41 },
        { month: "Last Mo.", ratio: profile?.emi_to_income_ratio ?? 0.44 },
      ];

  const emiRatio = profile?.emi_to_income_ratio ?? 0;
  const isDistressed =
    profile?.restructure_eligible ??
    (emiRatio > 0.40 || (profile?.dpd_worst && profile.dpd_worst !== "0") || profile?.stage === "Stressed" || profile?.stage === "Default-risk");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ── Search & Modular Customer Selector Bar ── */}
      <div className="p-6 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1F2430]">Customer Credit 360</h3>
            <p className="text-xs text-[#586071] mt-0.5">
              Live liquidity runway, contract obligations, and proactive early-warning default scoring.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8A92A2] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[rgba(31,36,48,0.06)]">
              {presets.length} profiles loaded
            </span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Manual search input with Name / ID support */}
          <div className="flex gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProfile(inputId)}
                placeholder="Search Customer ID (e.g. CUST-001) or Name…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(31,36,48,0.1)] text-sm bg-[#FAF8F5] focus:outline-none focus:border-[#435278] focus:bg-white transition-all font-mono"
              />
              <Search className="w-4 h-4 text-[#8A92A2] absolute left-3 top-3" />
            </div>

            <button
              onClick={() => loadProfile(inputId)}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[#435278] hover:bg-[#344161] text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Load</span>
            </button>
          </div>

          {/* Quick preset pills dynamically rendered from backend dataset */}
          <div className="flex items-center gap-2 flex-wrap">
            {presets.slice(0, 5).map((c) => {
              const isSelected = customerId === c.id;
              const isStressed = c.stage === "Stressed";
              const isDefault = c.stage === "Default-risk";
              const isWatch = c.stage === "Watch";
              const isHealthy = c.stage === "Healthy";

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setInputId(c.id);
                    loadProfile(c.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? "bg-[#435278] text-white border-[#435278] shadow-xs"
                      : "bg-[#FAF8F5] text-[#586071] border-[rgba(31,36,48,0.08)] hover:bg-[#F2EFE8] hover:text-[#1F2430]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? "bg-white"
                        : isDefault
                        ? "bg-[#991B1B]"
                        : isStressed
                        ? "bg-[#D16D6D]"
                        : isWatch
                        ? "bg-[#D49D4A]"
                        : "bg-[#729E85]"
                    }`}
                  />
                  <span>{c.label || `${c.name} (${c.stage})`}</span>
                </button>
              );
            })}

            {/* Quick dropdown for all available customers */}
            {presets.length > 5 && (
              <div className="relative">
                <select
                  value={customerId}
                  onChange={(e) => {
                    setInputId(e.target.value);
                    loadProfile(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#586071] border border-[rgba(31,36,48,0.08)] hover:bg-[#F2EFE8] focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>More Borrowers…</option>
                  {presets.slice(5, 30).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.name} ({c.stage})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#D16D6D] bg-[#FBEFEF] border border-[#F3D2D2] rounded-xl px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── Active Profile Detail Panel ── */}
      {profile && (
        <div className="p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs space-y-8">
          {/* Header with Name, Stage Badge, and Live Status */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h3 className="font-serif text-3xl font-bold text-[#1F2430]">
                  Customer Credit 360 · {profile.customer_name || customerId}
                </h3>
                <RiskBadge stage={profile.stage} />
              </div>
              <p className="text-xs text-[#8A92A2] font-mono">
                {customerId} · Continuous liquidity runway and early-warning default scoring
              </p>
            </div>
            <button
              onClick={() => loadProfile(customerId)}
              disabled={loading}
              className="p-2.5 rounded-xl hover:bg-[#F2EFE8] text-[#8A92A2] transition-colors border border-[rgba(31,36,48,0.06)] self-start cursor-pointer"
              title="Refresh profile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Primary Financial Capacity Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              label="Monthly Verified Income"
              value={`₹${profile.verified_monthly_income?.toLocaleString() ?? "—"}`}
              sub="Validated direct bank salary credit"
            />
            <StatCard
              label="Active Monthly EMI"
              value={`₹${profile.total_emi_obligations?.toLocaleString() ?? "—"}`}
              valueColor="#D49D4A"
              sub="Total cross-lender obligations"
            />
            <StatCard
              label="EMI-to-Income (R_EMI)"
              value={`${(emiRatio * 100).toFixed(1)}%`}
              valueColor={getEMIRatioColor(emiRatio)}
              sub={
                emiRatio > 0.45
                  ? "⚠ Above 45% danger zone"
                  : emiRatio > 0.35
                  ? "Watch range (35–45%)"
                  : "Healthy range (< 35%)"
              }
            />
            <StatCard
              label="Current DPD State"
              value={profile.dpd_worst || "0"}
              valueColor={getDPDColor(profile.dpd_worst)}
              sub={
                profile.dpd_worst === "0"
                  ? "On-time repayments"
                  : `Delinquency bucket: ${profile.dpd_worst} days`
              }
            />
          </div>

          {/* Secondary Early Warning Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              label="Cash Runway"
              value={`${profile.cash_runway_months?.toFixed(1) ?? "—"} mo`}
              valueColor={(profile.cash_runway_months ?? 99) < 2 ? "#D16D6D" : "#1F2430"}
              sub={(profile.cash_runway_months ?? 99) < 2 ? "Critical – < 2 months" : "Sufficient operational buffer"}
            />
            <StatCard
              label="Net Cash Flow"
              value={`₹${profile.net_cash_flow?.toLocaleString() ?? "—"}`}
              valueColor={(profile.net_cash_flow ?? 0) < 0 ? "#D16D6D" : "#729E85"}
              sub={(profile.net_cash_flow ?? 0) < 0 ? "Deficit: spending > income" : "Positive monthly surplus"}
            />
            <StatCard
              label="Late Payments (6mo)"
              value={profile.late_payment_count ?? 0}
              valueColor={(profile.late_payment_count ?? 0) > 2 ? "#D16D6D" : "#1F2430"}
              sub="Rolling 6-month repayment friction"
            />
            <StatCard
              label="Credit Utilisation"
              value={`${profile.credit_utilization_pct?.toFixed(0) ?? "—"}%`}
              valueColor={(profile.credit_utilization_pct ?? 0) > 80 ? "#D16D6D" : "#1F2430"}
              sub={(profile.credit_utilization_pct ?? 0) > 80 ? "High credit line reliance" : "Normal utilization"}
            />
          </div>

          {/* Active Loan Contract Details Card */}
          {profile.loan_principal && (
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Loan Principal</span>
                <span className="font-serif text-lg font-bold text-[#1F2430] mt-0.5 block">
                  ₹{profile.loan_principal.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Interest Rate</span>
                <span className="font-serif text-lg font-bold text-[#1F2430] mt-0.5 block">
                  {profile.loan_interest_rate}% p.a.
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Active Tenure</span>
                <span className="font-serif text-lg font-bold text-[#1F2430] mt-0.5 block">
                  {profile.loan_tenure_months} Months
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Outstanding Balance</span>
                <span className="font-serif text-lg font-bold text-[#435278] mt-0.5 block">
                  ₹{profile.loan_outstanding_balance?.toLocaleString() ?? "—"}
                </span>
              </div>
            </div>
          )}

          {/* Proactive Restructuring Callout (Dynamic Data-Backed) */}
          {isDistressed && (
            <div className="p-6 rounded-2xl bg-[#FCF5E9] border border-[#F3E0BE] flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D49D4A]" />
                  <h5 className="font-serif text-base font-bold text-[#1F2430]">
                    Proactive Loan Restructuring Action Available
                  </h5>
                </div>
                <p className="text-xs text-[#586071] leading-relaxed">
                  {profile.restructure_rationale || (
                    <>
                      EMI-to-income ratio of <strong>{(emiRatio * 100).toFixed(1)}%</strong> exceeds the safe threshold.
                      {profile.recent_scam_loss_flag && (
                        <> Customer experienced a recent ₹{profile.total_scam_loss?.toLocaleString()} fraud drain.</>
                      )}{" "}
                      Extend tenure by {profile.suggested_tenure_extension_months || 12} months to lower monthly EMI to{" "}
                      <strong>₹{profile.projected_restructured_emi?.toLocaleString() ?? "lower rate"}</strong>.
                    </>
                  )}
                </p>

                {profile.projected_restructured_emi && (
                  <div className="flex items-center gap-4 text-xs font-mono text-[#586071] pt-1">
                    <span>Current: ₹{profile.total_emi_obligations?.toLocaleString()} / mo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D49D4A]" />
                    <span className="text-[#729E85] font-bold">
                      Restructured: ₹{profile.projected_restructured_emi.toLocaleString()} / mo
                    </span>
                    <span className="text-[#8A92A2]">
                      ({profile.loan_tenure_months}m → {(profile.loan_tenure_months || 36) + (profile.suggested_tenure_extension_months || 12)}m)
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRestructure}
                disabled={restructuring}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs shadow-xs transition-all shrink-0 bg-[#D49D4A] hover:bg-[#C28C3B] text-white disabled:opacity-70 cursor-pointer"
              >
                {restructuring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Restructure…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Execute Restructure Offer</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Restructure Success Banner */}
          {restructureResult && (
            <div className="p-4 rounded-2xl bg-[#EBF3EE] border border-[#B6D8C0] flex items-center gap-3 text-xs text-[#285A3A]">
              <CheckCircle2 className="w-5 h-5 text-[#729E85] shrink-0" />
              <div className="flex-1">
                <strong>Loan Restructured Successfully:</strong> {restructureResult}
              </div>
            </div>
          )}

          {/* Scam Loss Signal Banner */}
          {profile.recent_scam_loss_flag && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FBEFEF] border border-[#F3D2D2]">
              <AlertTriangle className="w-5 h-5 text-[#D16D6D] shrink-0" />
              <div className="text-sm text-[#1F2430]">
                <span className="font-bold text-[#D16D6D]">Scam Loss Detected</span>
                <span className="mx-2 text-[#8A92A2]">·</span>
                <span>
                  Total scam drain:{" "}
                  <strong className="font-mono text-[#D16D6D]">
                    ₹{profile.total_scam_loss?.toLocaleString() ?? "—"}
                  </strong>
                  . Transaction telemetry confirmed unmitigated capital depletion directly reducing this customer's liquid buffer.
                </span>
              </div>
            </div>
          )}

          {/* EMI-to-Income 6-Month Historical Trajectory Chart */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#D16D6D]" />
                <h4 className="font-semibold text-sm text-[#1F2430]">EMI-to-Income Ratio — 6-Month Trend</h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-[#D49D4A]">Watch ≥ 35%</span>
                <span className="text-[#D16D6D]">Critical ≥ 45%</span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emiTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                  <XAxis dataKey="month" stroke="#8A92A2" fontSize={11} />
                  <YAxis
                    stroke="#8A92A2"
                    fontSize={11}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, "EMI Ratio"]}
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.97)",
                      borderRadius: 12,
                      border: "1px solid rgba(31,36,48,0.08)",
                      fontSize: 12,
                    }}
                  />
                  <ReferenceLine
                    y={0.45}
                    stroke="#D16D6D"
                    strokeDasharray="4 3"
                    label={{ value: "45% Zone", fill: "#D16D6D", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={0.35}
                    stroke="#D49D4A"
                    strokeDasharray="4 3"
                    label={{ value: "35% Watch", fill: "#D49D4A", fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="#435278"
                    strokeWidth={2.5}
                    dot={{ fill: "#435278", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="EMI Ratio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Repayment Score Gauge & Behavioral Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
              <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Composite Repayment Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className="font-serif text-3xl font-bold"
                  style={{
                    color:
                      (profile.repayment_score ?? 80) >= 75
                        ? "#729E85"
                        : (profile.repayment_score ?? 80) >= 50
                        ? "#D49D4A"
                        : "#D16D6D",
                  }}
                >
                  {profile.repayment_score?.toFixed(0) ?? "—"}
                </span>
                <span className="text-sm text-[#8A92A2]">/ 100</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${profile.repayment_score ?? 0}%`,
                    backgroundColor:
                      (profile.repayment_score ?? 0) >= 75
                        ? "#729E85"
                        : (profile.repayment_score ?? 0) >= 50
                        ? "#D49D4A"
                        : "#D16D6D",
                  }}
                />
              </div>
              <span className="text-[11px] text-[#8A92A2] mt-2 block">
                {(profile.repayment_score ?? 80) >= 75
                  ? "Prime repayment probability"
                  : (profile.repayment_score ?? 80) >= 50
                  ? "Elevated repayment sensitivity"
                  : "Imminent default probability"}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
              <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Spending Spike Anomaly</span>
              <div className="flex items-center gap-2 mt-2">
                {profile.spending_spike_flag ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-[#D49D4A]" />
                    <span className="font-bold text-[#D49D4A] text-sm">Spike Detected</span>
                    <span className="text-xs text-[#8A92A2]">– Abnormal expense velocity detected</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#729E85]" />
                    <span className="font-bold text-[#729E85] text-sm">Normal</span>
                    <span className="text-xs text-[#8A92A2]">– Expense pattern within historical baseline</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-[#8A92A2] mt-3 block">
                Monitors rapid discretionary expense surges or emergency cash withdrawals prior to EMI due date.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
