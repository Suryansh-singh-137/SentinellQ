"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  GitFork,
  CreditCard,
  ShoppingBag,
  Cpu,
  Bot,
  ChevronLeft,
  ChevronRight,
  Radio,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Clock,
  Home,
  ShieldCheck,
  Zap,
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "queue"
  | "mule_graph"
  | "credit_risk"
  | "shop_simulator"
  | "governance"
  | "assistant";

interface AppSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  openCasesCount?: number;
  wsConnected?: boolean;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  openCasesCount = 12,
  wsConnected = true,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navGroups = [
    {
      group: "Risk Intelligence",
      items: [
        {
          id: "overview" as DashboardTab,
          label: "Risk Overview",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: "queue" as DashboardTab,
          label: "Incident Queue",
          icon: ShieldAlert,
          badge: openCasesCount > 0 ? `${openCasesCount}` : null,
          badgeColor: "bg-[#FBEFEF] text-[#D16D6D] border border-[#F3D2D2]",
        },
        {
          id: "mule_graph" as DashboardTab,
          label: "Mule Ring Topology",
          icon: GitFork,
          badge: "k≤4",
        },
      ],
    },
    {
      group: "Credit & Default Prevention",
      items: [
        {
          id: "credit_risk" as DashboardTab,
          label: "Loan Early Warning",
          icon: CreditCard,
          badge: "DPD Monitor",
        },
      ],
    },
    {
      group: "Live Simulator",
      items: [
        {
          id: "shop_simulator" as DashboardTab,
          label: "Checkout Precheck",
          icon: ShoppingBag,
          badge: "Sub-200ms",
          badgeColor: "bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA]",
        },
      ],
    },
    {
      group: "AI Engine & Governance",
      items: [
        {
          id: "governance" as DashboardTab,
          label: "Model Drift & Shadow",
          icon: Cpu,
          badge: "PSI < 0.25",
        },
        {
          id: "assistant" as DashboardTab,
          label: "AI Risk Assistant",
          icon: Bot,
          badge: "Read-only",
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-[rgba(31,36,48,0.08)] bg-[#FFFFFF] transition-all duration-300 z-30 shrink-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand & Platform Header */}
      <div className="flex h-20 items-center justify-between px-5 border-b border-[rgba(31,36,48,0.06)]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.08)] shadow-xs">
            <div className="h-5 w-5 rounded-full border border-[#435278]/40 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[#435278] flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-[#8FB8A0]" />
              </div>
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1F2430]">
                SentinelIQ
              </span>
              <span className="text-[10px] tracking-[0.14em] uppercase text-[#586071] font-semibold -mt-1">
                Risk Console
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-[#586071] hover:bg-[#FAF8F5] hover:text-[#1F2430] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Real-time System Heartbeat Status */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  wsConnected ? "bg-[#8FB8A0]" : "bg-[#E8B86B]"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  wsConnected ? "bg-[#729E85]" : "bg-[#D49D4A]"
                }`}
              />
            </span>
            <span className="font-medium text-[#1F2430]">
              {wsConnected ? "Engine Dual-Active" : "Connecting..."}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#586071] bg-white px-2 py-0.5 rounded-full border border-[rgba(31,36,48,0.06)] tnum">
            142ms
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A92A2] block mb-1">
                {group.group}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#435278] text-white shadow-xs font-semibold"
                      : "text-[#586071] hover:bg-[#FAF8F5] hover:text-[#1F2430]"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-white" : "text-[#435278]"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeColor ||
                            "bg-[#F5F2EB] text-[#586071] border border-[rgba(31,36,48,0.06)]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-[rgba(31,36,48,0.06)] bg-[#FAF8F5]/60 space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#586071] hover:text-[#1F2430] hover:bg-white transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title="Return to Marketing Landing Page"
        >
          <Home className="w-4 h-4 text-[#435278]" />
          {!collapsed && <span>Back to Home</span>}
        </Link>

        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-white border border-[rgba(31,36,48,0.06)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#EEF2F7] border border-[#D1E0EE] flex items-center justify-center font-bold text-[#435278] text-xs">
                OP
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#1F2430]">Risk Ops</span>
                <span className="text-[10px] text-[#8A92A2]">Tier 2 Lead</span>
              </div>
            </div>
            <span className="inline-flex h-2 w-2 rounded-full bg-[#8FB8A0]" />
          </div>
        )}
      </div>
    </aside>
  );
}
