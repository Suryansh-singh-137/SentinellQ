"use client";

import React, { useState, useCallback } from "react";
import { Search, RefreshCw, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { getLoanCreditProfile, CustomerCreditProfile } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const PRESET_CUSTOMERS = [
  { id: "CUST-001", label: "Aarav Sharma (Stressed)" },
  { id: "CUST-002", label: "Priya Nair (High Risk)" },
  { id: "CUST-003", label: "Rohan Mehta (Watch)" },
  { id: "CUST-004", label: "Anjali Rao (Healthy)" },
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

/** Generates a simple 6-month EMI-to-income trend line for a profile */
function buildEMITrend(profile: CustomerCreditProfile) {
  const base = profile.emi_to_income_ratio;
  return ["6m ago", "5m ago", "4m ago", "3m ago", "2m ago", "Last Mo."].map((month, i) => {
    const drift = (i - 5) * 0.012 * (Math.random() > 0.5 ? 1 : -1);
    return {
      month,
      ratio: Math.max(0.1, Math.min(0.95, base + drift)).toFixed(2),
    };
  });
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  valueColor = "#1F2430",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
      <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">{label}</span>
      <span className="font-serif text-2xl font-bold mt-1 block" style={{ color: valueColor }}>
        {value}
      </span>
      {sub && <span className="text-[11px] text-[#8A92A2] mt-0.5 block">{sub}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Risk Indicator Badge
// ─────────────────────────────────────────────
function RiskBadge({ stage }: { stage: string | undefined }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    Healthy:       { bg: "#EBF3EE", text: "#729E85",  label: "Healthy" },
    Watch:         { bg: "#FCF5E9", text: "#D49D4A",  label: "Watch" },
    Stressed:      { bg: "#FBEFEF", text: "#D16D6D",  label: "Stressed" },
    "Default-risk":{ bg: "#FEE2E2", text: "#991B1B",  label: "Default Risk" },
  };
  const style = map[stage ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280", label: stage ?? "Unknown" };
  return (
    <span
      className="text-xs font-bold px-3 py-1 rounded-full"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main CreditRiskTab
// ─────────────────────────────────────────────

export function CreditRiskTab() {
  const [customerId, setCustomerId] = useState("CUST-001");
  const [inputId, setInputId]       = useState("CUST-001");
  const [profile, setProfile]       = useState<CustomerCreditProfile | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [restructuring, setRestructuring] = useState(false);
  const [restructured, setRestructured]   = useState(false);

  const loadProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setRestructured(false);
    try {
      const data = await getLoanCreditProfile(id);
      setProfile(data);
      setCustomerId(id);
    } catch {
      setError("Could not load profile. Ensure backend is running and customer ID is valid.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load default on mount
  React.useEffect(() => { loadProfile("CUST-001"); }, [loadProfile]);

  const handleRestructure = async () => {
    setRestructuring(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate API call
    setRestructuring(false);
    setRestructured(true);
  };

  const emiTrend = profile ? buildEMITrend(profile) : [];
  const emiRatio = profile?.emi_to_income_ratio ?? 0;
  const isDistressed = emiRatio > 0.40 || (profile?.dpd_worst && profile.dpd_worst !== "0");

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Search & Preset Bar ── */}
      <div className="p-6 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#1F2430]">Customer Credit 360</h3>
        <p className="text-xs text-[#586071]">Search any customer to view their live liquidity runway and early-warning default signals.</p>

        <div className="flex gap-3 flex-wrap">
          {/* Manual search */}
          <div className="flex gap-2 flex-1 min-w-[280px]">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadProfile(inputId)}
              placeholder="Enter Customer ID (e.g. CUST-001)…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(31,36,48,0.1)] text-sm bg-[#FAF8F5] focus:outline-none focus:border-[#435278]"
            />
            <button
              onClick={() => loadProfile(inputId)}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[#435278] hover:bg-[#344161] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Load</span>
            </button>
          </div>

          {/* Quick preset pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_CUSTOMERS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setInputId(c.id);
                  loadProfile(c.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  customerId === c.id
                    ? "bg-[#435278] text-white"
                    : "bg-[#FAF8F5] text-[#586071] border border-[rgba(31,36,48,0.08)] hover:bg-[#F2EFE8]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#D16D6D] bg-[#FBEFEF] border border-[#F3D2D2] rounded-xl px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── Profile Panel ── */}
      {profile && (
        <div className="p-8 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-serif text-2xl font-bold text-[#1F2430]">
                  {profile.customer_name || customerId}
                </h3>
                <RiskBadge stage={profile.stage} />
              </div>
              <p className="text-xs text-[#8A92A2] font-mono">{customerId} · Continuous liquidity runway and early-warning default scoring</p>
            </div>
            <button
              onClick={() => loadProfile(customerId)}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-[#F2EFE8] text-[#8A92A2] transition-colors"
              title="Refresh profile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              label="Monthly Verified Income"
              value={`₹${profile.verified_monthly_income?.toLocaleString() ?? "—"}`}
            />
            <StatCard
              label="Active Monthly EMI"
              value={`₹${profile.total_emi_obligations?.toLocaleString() ?? "—"}`}
              valueColor="#D49D4A"
            />
            <StatCard
              label="EMI-to-Income (R_EMI)"
              value={`${(emiRatio * 100).toFixed(1)}%`}
              valueColor={getEMIRatioColor(emiRatio)}
              sub={emiRatio > 0.45 ? "⚠ Above 45% danger zone" : emiRatio > 0.35 ? "Watch range" : "Healthy range"}
            />
            <StatCard
              label="Current DPD State"
              value={profile.dpd_worst || "DPD 0"}
              valueColor={getDPDColor(profile.dpd_worst)}
            />
          </div>

          {/* Secondary Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              label="Cash Runway"
              value={`${profile.cash_runway_months?.toFixed(1) ?? "—"} mo`}
              valueColor={(profile.cash_runway_months ?? 99) < 2 ? "#D16D6D" : "#1F2430"}
              sub={(profile.cash_runway_months ?? 99) < 2 ? "Critical – < 2 months" : "Sufficient"}
            />
            <StatCard
              label="Net Cash Flow"
              value={`₹${profile.net_cash_flow?.toLocaleString() ?? "—"}`}
              valueColor={(profile.net_cash_flow ?? 0) < 0 ? "#D16D6D" : "#729E85"}
            />
            <StatCard
              label="Late Payments (6mo)"
              value={profile.late_payment_count ?? 0}
              valueColor={(profile.late_payment_count ?? 0) > 2 ? "#D16D6D" : "#1F2430"}
            />
            <StatCard
              label="Credit Utilisation"
              value={`${profile.credit_utilization_pct?.toFixed(0) ?? "—"}%`}
              valueColor={(profile.credit_utilization_pct ?? 0) > 80 ? "#D16D6D" : "#1F2430"}
              sub={(profile.credit_utilization_pct ?? 0) > 80 ? "High utilisation" : "Normal"}
            />
          </div>

          {/* EMI-to-Income 6-Month Trend */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-[#D16D6D]" />
              <h4 className="font-semibold text-sm text-[#1F2430]">EMI-to-Income Ratio — 6-Month Trend</h4>
              <span className="text-xs text-[#8A92A2] ml-auto">Red zone ≥ 45%</span>
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
                  <ReferenceLine y={0.45} stroke="#D16D6D" strokeDasharray="4 3" label={{ value: "45% Zone", fill: "#D16D6D", fontSize: 10 }} />
                  <ReferenceLine y={0.35} stroke="#D49D4A" strokeDasharray="4 3" label={{ value: "35% Watch", fill: "#D49D4A", fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke="#435278"
                    strokeWidth={2}
                    dot={{ fill: "#435278", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="EMI Ratio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scam Loss Signal */}
          {profile.recent_scam_loss_flag && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FBEFEF] border border-[#F3D2D2]">
              <AlertTriangle className="w-5 h-5 text-[#D16D6D] shrink-0" />
              <div className="text-sm text-[#1F2430]">
                <span className="font-bold text-[#D16D6D]">Scam Loss Detected</span>
                <span className="mx-2 text-[#8A92A2]">·</span>
                <span>
                  Total scam drain: <strong className="font-mono">₹{profile.total_scam_loss?.toLocaleString() ?? "—"}</strong>. This loss is directly reducing this customer's cash runway and repayment capacity.
                </span>
              </div>
            </div>
          )}

          {/* Proactive Restructuring CTA */}
          {isDistressed && (
            <div className="p-6 rounded-2xl bg-[#FCF5E9] border border-[#F3E0BE] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h5 className="font-serif text-base font-bold text-[#1F2430]">
                  Proactive Loan Restructuring Action Available
                </h5>
                <p className="text-xs text-[#586071] mt-1">
                  EMI-to-income ratio of{" "}
                  <strong>{(emiRatio * 100).toFixed(1)}%</strong> exceeds safe threshold.
                  {profile.recent_scam_loss_flag && (
                    <> Combined with scam loss, extending tenure reduces monthly burden significantly.</>
                  )}{" "}
                  Recommend extending tenure by 12–18 months.
                </p>
              </div>
              <button
                onClick={handleRestructure}
                disabled={restructuring || restructured}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs shadow-xs transition-all shrink-0 ${
                  restructured
                    ? "bg-[#729E85] text-white"
                    : "bg-[#D49D4A] hover:bg-[#C28C3B] text-white"
                } disabled:opacity-70`}
              >
                {restructuring && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {restructured && <CheckCircle2 className="w-3.5 h-3.5" />}
                {restructuring ? "Queuing Offer…" : restructured ? "Offer Sent" : "Execute Restructure Offer"}
              </button>
            </div>
          )}

          {/* Repayment Score Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
              <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Repayment Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-3xl font-bold" style={{ color: (profile.repayment_score ?? 80) >= 75 ? "#729E85" : (profile.repayment_score ?? 80) >= 50 ? "#D49D4A" : "#D16D6D" }}>
                  {profile.repayment_score?.toFixed(0) ?? "—"}
                </span>
                <span className="text-sm text-[#8A92A2]">/ 100</span>
              </div>
              {/* Simple bar gauge */}
              <div className="mt-3 h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${profile.repayment_score ?? 0}%`,
                    backgroundColor: (profile.repayment_score ?? 0) >= 75 ? "#729E85" : (profile.repayment_score ?? 0) >= 50 ? "#D49D4A" : "#D16D6D",
                  }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)]">
              <span className="text-[11px] font-mono text-[#8A92A2] uppercase block">Spending Spike Signal</span>
              <div className="flex items-center gap-2 mt-2">
                {profile.spending_spike_flag ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-[#D49D4A]" />
                    <span className="font-bold text-[#D49D4A] text-sm">Spike Detected</span>
                    <span className="text-xs text-[#8A92A2]">– Rapid expense growth pattern</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#729E85]" />
                    <span className="font-bold text-[#729E85] text-sm">Normal</span>
                    <span className="text-xs text-[#8A92A2]">– Expense within expected range</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
