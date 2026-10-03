"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole, DEMO_USERS_MAP } from "@/context/AuthContext";
import {
  ShieldAlert,
  ShoppingBag,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const initialRoleParam = searchParams.get("role") as UserRole | null;

  const { login, quickLogin, isLoading, user, isAuthenticated } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRole>(
    initialRoleParam === "customer" ? "customer" : "analyst"
  );
  const [emailOrUsername, setEmailOrUsername] = useState<string>(
    activeRole === "analyst"
      ? DEMO_USERS_MAP.analyst.email
      : DEMO_USERS_MAP.customer.email
  );
  const [password, setPassword] = useState<string>(
    activeRole === "analyst"
      ? DEMO_USERS_MAP.analyst.password
      : DEMO_USERS_MAP.customer.password
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Switch role tabs and populate sensible demo defaults
  const handleRoleTabChange = (role: UserRole) => {
    setActiveRole(role);
    setErrorMsg(null);
    setEmailOrUsername(DEMO_USERS_MAP[role].email);
    setPassword(DEMO_USERS_MAP[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await login(emailOrUsername, password, activeRole);
      if (res.success) {
        const dest =
          redirectUrl || (res.role === "customer" ? "/shop" : "/dashboard");
        router.push(dest);
      } else {
        setErrorMsg(res.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await quickLogin(role);
      const dest = redirectUrl || (role === "customer" ? "/shop" : "/dashboard");
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Quick login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#E2E8F0]">
      {/* Top Bar with Brand and Return Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#586071] hover:text-[#1F2430] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {isAuthenticated && user && (
          <span className="text-[11px] font-mono text-[#8FB8A0] bg-[#EBF3EE] px-2.5 py-1 rounded-full border border-[#D1E5DA]">
            Signed in: {user.role.toUpperCase()}
          </span>
        )}
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto pt-6">
        <div className="bg-white rounded-3xl border border-[rgba(31,36,48,0.08)] shadow-lg shadow-black/[0.03] p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle Ambient Gradient Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#435278]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-4 group">
              <div className="h-11 w-11 rounded-2xl bg-white border border-[rgba(31,36,48,0.1)] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <div className="h-6 w-6 rounded-full border border-[#435278]/30 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-[#435278] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8FB8A0]" />
                  </div>
                </div>
              </div>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2430] tracking-tight">
              SentinelIQ Access Portal
            </h1>
            <p className="text-xs text-[#586071] mt-1.5">
              Select your role workspace to sign in securely
            </p>
          </div>

          {/* Role Segmented Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-2xl border border-[rgba(31,36,48,0.06)] mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleTabChange("analyst")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeRole === "analyst"
                  ? "bg-[#435278] text-white shadow-xs"
                  : "text-[#586071] hover:text-[#1F2430]"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Risk Analyst</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange("customer")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeRole === "customer"
                  ? "bg-[#435278] text-white shadow-xs"
                  : "text-[#586071] hover:text-[#1F2430]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer User</span>
            </button>
          </div>

          {/* Role Context Callout */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] text-xs text-[#586071] mb-6 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#435278] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#1F2430] block">
                {activeRole === "analyst"
                  ? "Risk Operations Clearance"
                  : "Consumer Banking & Shopping Simulator"}
              </span>
              <span className="text-[11px] leading-relaxed text-[#727B8D]">
                {activeRole === "analyst"
                  ? "Direct access to prioritized case holds, SHAP explainability, multi-hop mule graphs, and ML governance."
                  : "Direct access to retail e-commerce checkout (/shop), real-time UPI pre-check intercepts, and loan health."}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-[#FBEFEF] border border-[#F3D2D2] text-xs text-[#D16D6D] flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A92A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  placeholder={
                    activeRole === "analyst"
                      ? "analyst@sentineliq.ai"
                      : "customer@sentineliq.ai"
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] focus:outline-none focus:border-[#435278] bg-[#FAF8F5] focus:bg-white transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1F2430]">
                  Password
                </label>
                <span className="text-[11px] text-[#8A92A2] font-mono">
                  Demo: {activeRole === "analyst" ? "analyst123" : "customer123"}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A92A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] focus:outline-none focus:border-[#435278] bg-[#FAF8F5] focus:bg-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A92A2] hover:text-[#1F2430]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3.5 rounded-full bg-[#435278] hover:bg-[#344161] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-[#8FB8A0]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    Sign In to{" "}
                    {activeRole === "analyst" ? "Analyst Dashboard" : "Customer Portal"}
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill 1-Click Demo Buttons */}
          <div className="pt-6 mt-6 border-t border-[rgba(31,36,48,0.06)]">
            <span className="text-[11px] font-semibold text-[#8A92A2] uppercase tracking-wider block text-center mb-3">
              One-Click Instant Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("analyst")}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[rgba(31,36,48,0.12)] bg-[#FAF8F5] hover:bg-[#F2EFE8] text-[#1F2430] text-xs font-semibold shadow-2xs transition-all cursor-pointer text-center"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#435278]" />
                <span>As Analyst</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("customer")}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[rgba(31,36,48,0.12)] bg-[#FAF8F5] hover:bg-[#F2EFE8] text-[#1F2430] text-xs font-semibold shadow-2xs transition-all cursor-pointer text-center"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#8FB8A0]" />
                <span>As Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="text-center mt-6 text-[11px] text-[#8A92A2] flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#8FB8A0]" />
          <span>Role-Based Access Control (RBAC) · JWT Encrypted Sessions</span>
        </div>
      </div>

      <div />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <Activity className="w-6 h-6 text-[#435278] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
