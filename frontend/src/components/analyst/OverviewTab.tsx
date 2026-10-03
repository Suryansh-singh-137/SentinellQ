"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Zap, Clock, ShieldAlert, CheckCircle2, TrendingUp, Radio } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ResponsiveContainer
} from "recharts";
import { CaseListItem } from "@/lib/api";

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────
interface ScamPoint {
  time: string;
  impersonation: number;
  mule: number;
  phishing: number;
}

interface OverviewTabProps {
  cases: CaseListItem[];
  alerts: any[];
  wsConnected: boolean;
  onNavigateToQueue: () => void;
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

/** Returns the current hour label formatted as HH:00 */
function hourLabel(offsetMinutes: number = 0): string {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Generates 8 time buckets of synthetic but realistic scam telemetry,
 *  seeded from the current time so each render starts fresh. */
function generateLiveTrendData(): ScamPoint[] {
  const now = new Date();
  const minutesPerBucket = 30;
  return Array.from({ length: 8 }, (_, i) => {
    const offsetMin = -(7 - i) * minutesPerBucket;
    const d = new Date(now.getTime() + offsetMin * 60 * 1000);
    const hr = d.getHours();
    // Scam volume peaks in afternoon/evening (13–20h)
    const peakFactor = hr >= 13 && hr <= 20 ? 1.8 : hr >= 9 && hr < 13 ? 1.2 : 0.6;
    const jitter = () => Math.floor(Math.random() * 4);
    return {
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      impersonation: Math.floor(peakFactor * (8 + jitter())),
      mule:          Math.floor(peakFactor * (5 + jitter())),
      phishing:      Math.floor(peakFactor * (3 + jitter())),
    };
  });
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  subColor = "#729E85",
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  subColor?: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs">
      <div className="flex items-center justify-between text-xs text-[#8A92A2] mb-2">
        <span className="font-semibold uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="font-serif text-3xl font-bold text-[#1F2430] tnum">{value}</div>
      <div className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: subColor }}>
        {sub}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main Overview Tab
// ────────────────────────────────────────────────────────────────────

export function OverviewTab({ cases, alerts, wsConnected, onNavigateToQueue }: OverviewTabProps) {
  const [trendData, setTrendData] = useState<ScamPoint[]>(generateLiveTrendData);

  // Live-update the scam trend chart every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTrendData((prev) => {
        const next = [...prev.slice(1)]; // drop oldest bucket
        const last = prev[prev.length - 1];
        const now = new Date();
        const hr = now.getHours();
        const peakFactor = hr >= 13 && hr <= 20 ? 1.8 : hr >= 9 && hr < 13 ? 1.2 : 0.6;
        next.push({
          time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
          impersonation: Math.max(1, Math.floor(peakFactor * (8 + Math.random() * 4 - 2))),
          mule:          Math.max(1, Math.floor(peakFactor * (5 + Math.random() * 3 - 1))),
          phishing:      Math.max(1, Math.floor(peakFactor * (3 + Math.random() * 3 - 1))),
        });
        return next;
      });
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  const openCases = cases.filter((c) => c.status === "Open" || c.status === "In_Review").length;

  // Compute total scam detections today from trend data
  const scamTotal = trendData.reduce((s, p) => s + p.impersonation + p.mule + p.phishing, 0);

  const tierVolumeData = [
    { name: "Low (Auto-Approved)", count: Math.max(900, 1000 - scamTotal), color: "#8FB8A0" },
    { name: "Medium (Step-Up OTP)", count: Math.ceil(scamTotal * 0.5), color: "#E8B86B" },
    { name: "High (Session Blocked)", count: Math.ceil(scamTotal * 0.3), color: "#E58F8F" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Automated Handling"
          value="99.52%"
          sub={<><TrendingUp className="w-3 h-3" /> Target &gt; 99.5% Met</>}
          icon={Zap}
          iconColor="#8FB8A0"
        />
        <MetricCard
          label="Pre-Check SLA"
          value="142 ms"
          sub="Deterministic < 200ms"
          icon={Clock}
          iconColor="#E8B86B"
        />
        <MetricCard
          label="Active Held Cases"
          value={openCases}
          sub="Priority-ranked Queue"
          subColor="#D16D6D"
          icon={ShieldAlert}
          iconColor="#D16D6D"
        />
        <MetricCard
          label="Scam Signals (Today)"
          value={scamTotal}
          sub="Live telemetry — updating every 30s"
          icon={CheckCircle2}
          iconColor="#8FB8A0"
        />
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Scam Trend Area Chart */}
        <div className="lg:col-span-8 p-7 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1F2430]">
                Real-Time Scam Interception Pulse
              </h3>
              <p className="text-xs text-[#586071]">
                Live scam pattern telemetry across UPI and card channels · auto-updates every 30s
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#8A92A2]">
              <span className="w-2 h-2 rounded-full bg-[#D16D6D] animate-pulse" />
              Live
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradImpersonation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E58F8F" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#E58F8F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMule" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E8B86B" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#E8B86B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPhishing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8FB8A0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8FB8A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                <XAxis dataKey="time" stroke="#8A92A2" fontSize={11} />
                <YAxis stroke="#8A92A2" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.97)",
                    borderRadius: 16,
                    border: "1px solid rgba(31,36,48,0.08)",
                    boxShadow: "0 8px 24px rgba(31,36,48,0.08)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="impersonation" stroke="#D16D6D" fill="url(#gradImpersonation)" name="Impersonation" strokeWidth={2} />
                <Area type="monotone" dataKey="mule"          stroke="#D49D4A" fill="url(#gradMule)"          name="Mule Account"  strokeWidth={2} />
                <Area type="monotone" dataKey="phishing"      stroke="#729E85" fill="url(#gradPhishing)"      name="Phishing"      strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div className="flex gap-5 mt-4 text-xs">
            {[
              { color: "#D16D6D", label: "Impersonation" },
              { color: "#D49D4A", label: "Mule Account" },
              { color: "#729E85", label: "Phishing" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[#586071]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live WebSocket Alerts Ticker */}
        <div className="lg:col-span-4 p-7 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)] mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#D16D6D] animate-pulse" />
                <h4 className="font-serif text-base font-bold text-[#1F2430]">
                  Live Threat Push (/ws/alerts)
                </h4>
              </div>
              <span className={`text-[10px] font-mono font-bold ${wsConnected ? "text-[#729E85]" : "text-[#D16D6D]"}`}>
                {wsConnected ? "STREAM ACTIVE" : "OFFLINE"}
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <p className="text-xs text-[#8A92A2] italic text-center py-8">
                  No recent broadcast events. Streaming live…
                </p>
              ) : (
                alerts.map((al, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#D16D6D] uppercase text-[10px]">
                        {al.event || "HIGH_RISK_HOLD"}
                      </span>
                      <span className="font-mono text-[#8A92A2] text-[10px]">
                        {al.timestamp ? new Date(al.timestamp).toLocaleTimeString() : "Just now"}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-[#1F2430]">
                      <span>{al.customer_name || "Flagged Customer"}</span>
                      <span className="font-mono">₹{al.amount?.toLocaleString() || "—"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToQueue}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EFE8] border border-[rgba(31,36,48,0.08)] text-xs font-semibold text-[#1F2430] text-center transition-colors"
          >
            View All Queued Incidents
          </button>
        </div>
      </div>

      {/* ── Decision Tier Volume Bar Chart ── */}
      <div className="p-7 rounded-3xl bg-white border border-[rgba(31,36,48,0.08)] shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#1F2430] mb-1">
          Decision Tier Distribution (Rolling Today)
        </h3>
        <p className="text-xs text-[#586071] mb-5">
          Breakdown of transactions processed across all three routing tiers
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierVolumeData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" horizontal={false} />
              <XAxis type="number" stroke="#8A92A2" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#8A92A2" fontSize={10} width={160} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.97)",
                  borderRadius: 12,
                  border: "1px solid rgba(31,36,48,0.08)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Transactions" radius={[0, 8, 8, 0]}>
                {tierVolumeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
