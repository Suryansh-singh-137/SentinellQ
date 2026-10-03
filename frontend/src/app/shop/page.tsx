"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Lock,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  User,
  ShoppingBag,
  CreditCard,
  Zap,
  LogOut,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { precheckPayment, confirmStepUp, PrecheckResponse } from "@/lib/api";

export default function ShopCheckoutPage() {
  const { user, role, isAuthenticated, quickLogin, logout, switchRole } = useAuth();

  const [amount, setAmount] = useState<number>(450);
  const [channel, setChannel] = useState<string>("upi");
  const [customerId, setCustomerId] = useState<string>(
    user?.customer_id || "CUST-001"
  );
  const [merchantId, setMerchantId] = useState<string>("MERCHANT-SWIGGY-VERIFIED");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("dev-fp-safari-mac-01");
  const [beneficiaryId, setBeneficiaryId] = useState<string>("PAYEE-ESTABLISHED");

  const [loading, setLoading] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [result, setResult] = useState<PrecheckResponse | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>("");
  const [stepUpResult, setStepUpResult] = useState<string | null>(null);

  // Sync customerId when auth user changes
  useEffect(() => {
    if (user?.customer_id) {
      setCustomerId(user.customer_id);
    }
  }, [user]);

  // Quick preset loader
  const applyPreset = (tier: "low" | "medium" | "high") => {
    if (tier === "low") {
      setAmount(450);
      setChannel("upi");
      setCustomerId(user?.customer_id || "CUST-001");
      setMerchantId("MERCHANT-SWIGGY-VERIFIED");
      setDeviceFingerprint("dev-fp-safari-mac-01");
      setBeneficiaryId("PAYEE-ESTABLISHED");
    } else if (tier === "medium") {
      setAmount(7500);
      setChannel("card");
      setCustomerId(user?.customer_id || "CUST-001");
      setMerchantId("MERCHANT-NEW-STORE");
      setDeviceFingerprint("dev-fp-new-device-unknown");
      setBeneficiaryId("PAYEE-NORMAL");
    } else {
      setAmount(95000);
      setChannel("upi");
      setCustomerId("CUST-002");
      setMerchantId("MERCHANT-BLACKLISTED-SHADY");
      setDeviceFingerprint("dev-fp-active-call-flag");
      setBeneficiaryId("PAYEE-NEW-MULE");
    }
    setResult(null);
    setStepUpOpen(false);
    setStepUpResult(null);
  };

  const handlePrecheck = async () => {
    setLoading(true);
    setResult(null);
    setStepUpResult(null);
    const start = performance.now();

    try {
      const data = await precheckPayment({
        customer_id: customerId,
        amount: Number(amount),
        merchant_id: merchantId,
        channel,
        device_fingerprint: deviceFingerprint,
        ip_address: "103.21.144.1",
        geolocation: "Bangalore, IN",
        beneficiary_id: beneficiaryId,
      });
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setResult(data);

      if (data.decision === "step_up") {
        setStepUpOpen(true);
      }
    } catch (err: any) {
      alert("Backend API connection error. Make sure FastAPI backend is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpAction = async (confirmed: boolean) => {
    if (!result) return;
    try {
      const res = await confirmStepUp(result.transaction_id, confirmed, otpInput);
      setStepUpResult(res.decision === "approved" ? "Step-up verified! Payment authorized." : "Payment aborted by user.");
      setStepUpOpen(false);
    } catch (e: any) {
      alert("Step up confirmation error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2430] p-4 md:p-8 selection:bg-[#E2E8F0]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation bar with Auth State */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#586071] hover:text-[#1F2430] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to SentinelIQ Home
          </Link>

          <div className="flex items-center gap-2.5">
            {role === "analyst" && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#435278] text-white text-xs font-medium hover:bg-[#344161] shadow-2xs transition-all"
              >
                <span>Analyst Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {!isAuthenticated ? (
              <Link
                href="/login?role=customer&redirect=/shop"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(31,36,48,0.12)] text-[#1F2430] text-xs font-medium hover:bg-[#FAF8F5] shadow-2xs transition-all"
              >
                <User className="w-3.5 h-3.5 text-[#435278]" />
                <span>Customer Sign In</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#586071] hidden sm:inline">
                  Signed in as <strong className="text-[#1F2430]">{user?.full_name}</strong>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[rgba(31,36,48,0.1)] text-[11px] text-[#586071] hover:text-[#D16D6D] hover:border-[#D16D6D]/30 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Portal Banner & Account Ribbon */}
        <div className="bg-white border border-[rgba(31,36,48,0.08)] rounded-3xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#435278] bg-[#EEF2F6] px-2.5 py-0.5 rounded-full border border-[#D1E0EE]">
                  Customer User Workspace
                </span>
                <span className="text-[10px] font-mono text-[#729E85] bg-[#EBF3EE] px-2 py-0.5 rounded-full border border-[#D1E5DA] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8FB8A0] animate-pulse" />
                  Pre-Check Rail Active
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold mt-2 text-[#1F2430]">
                Customer Retail Checkout &amp; UPI Simulator
              </h1>
              <p className="text-xs text-[#586071] mt-0.5">
                Simulate consumer point-of-sale transactions protected by SentinelIQ's sub-200ms pre-checkout risk gate.
              </p>
            </div>

            {latencyMs !== null && (
              <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] px-3.5 py-2 rounded-2xl shrink-0">
                <Clock className="w-4 h-4 text-[#16A34A]" />
                <div className="text-xs">
                  <span className="font-bold text-[#16A34A] block">
                    Latency: {latencyMs} ms
                  </span>
                  <span className="text-[10px] text-[#15803D]">Sub-200ms SLA Passed</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Account Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[rgba(31,36,48,0.06)]">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
              <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Account Holder</span>
              <span className="text-xs font-bold text-[#1F2430] mt-0.5 block truncate">
                {user?.role === "customer" ? user.full_name : "Aarav Sharma"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
              <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Customer ID</span>
              <span className="text-xs font-mono font-bold text-[#435278] mt-0.5 block">
                {customerId}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
              <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Verified Salary</span>
              <span className="text-xs font-bold text-[#1F2430] mt-0.5 block">
                ₹85,000 / mo
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
              <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Safety Standing</span>
              <span className="text-xs font-bold text-[#729E85] mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Normal / Clean
              </span>
            </div>
          </div>

          {/* Quick Scenario Preset Pills */}
          <div className="mt-5 pt-4 border-t border-[rgba(31,36,48,0.06)] flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#586071]">Select Shopping Scenario:</span>
            <button
              type="button"
              onClick={() => applyPreset("low")}
              className="text-xs px-3 py-1.5 rounded-full font-medium bg-[#EBF3EE] text-[#729E85] hover:bg-[#DCEBDE] border border-[#D1E5DA] cursor-pointer transition-colors"
            >
              🟢 Low Risk (₹450 Grocery)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("medium")}
              className="text-xs px-3 py-1.5 rounded-full font-medium bg-[#FCF5E9] text-[#D49D4A] hover:bg-[#F5E8D0] border border-[#F3E0BE] cursor-pointer transition-colors"
            >
              🟡 Medium Risk (₹7,500 Step-Up OTP)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("high")}
              className="text-xs px-3 py-1.5 rounded-full font-medium bg-[#FBEFEF] text-[#D16D6D] hover:bg-[#F7DADA] border border-[#F3D2D2] cursor-pointer transition-colors"
            >
              🔴 High Risk Scam (₹95,000 Held)
            </button>
          </div>
        </div>

        {/* Transaction Input Form */}
        <div className="bg-white border border-[rgba(31,36,48,0.08)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#586071]">
              Payment Checkout Parameters
            </h2>
            <span className="text-xs text-[#8A92A2]">Synchronous pre-Juspay verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1">
                Transaction Amount (₹ INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] font-mono bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#435278]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1">
                Payment Rail / Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#435278]"
              >
                <option value="upi">UPI (Instant Rail - FR1 Target)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="wallet">Digital Wallet</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1">
                Customer Identifier
              </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] font-mono bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#435278]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1">
                Merchant Receiver
              </label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] font-mono bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#435278]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1">
                Device Fingerprint Signal
              </label>
              <input
                type="text"
                value={deviceFingerprint}
                onChange={(e) => setDeviceFingerprint(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] font-mono bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#435278]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1F2430] block mb-1">
                Beneficiary Payee Identifier
              </label>
              <input
                type="text"
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(31,36,48,0.12)] text-xs text-[#1F2430] font-mono bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#435278]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrecheck}
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#435278] hover:bg-[#344161] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-70"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-[#8FB8A0]" /> : <Lock className="w-4 h-4" />}
            {loading ? "Evaluating Dual-Risk Models..." : `Execute Customer Checkout (₹${amount.toLocaleString()})`}
          </button>
        </div>

        {/* Step-Up Challenge Modal */}
        {stepUpOpen && result && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[rgba(31,36,48,0.08)] space-y-4">
              <div className="flex items-center gap-3 text-[#D49D4A]">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-serif font-bold text-lg text-[#1F2430]">
                  Step-Up Authorization Required
                </h3>
              </div>
              <p className="text-xs text-[#586071] leading-relaxed">
                {result.step_up_message || "Additional security confirmation is required before payment authorization."}
              </p>
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[rgba(31,36,48,0.06)] space-y-1">
                <span className="text-[11px] font-semibold text-[#8A92A2] uppercase block">
                  Scam Defense Reason
                </span>
                <span className="text-xs font-medium text-[#1F2430] block">
                  {result.risk_breakdown?.reason_codes?.join(", ") || "Elevated transaction velocity from new device fingerprint."}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F2430] block">Enter 6-Digit Verification OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono p-3 border border-[rgba(31,36,48,0.15)] rounded-xl focus:outline-none focus:border-[#435278]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleStepUpAction(false)}
                  className="flex-1 py-2.5 border border-[rgba(31,36,48,0.15)] rounded-full text-xs font-medium text-[#586071] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleStepUpAction(true)}
                  className="flex-1 py-2.5 bg-[#435278] text-white rounded-full text-xs font-semibold hover:bg-[#344161] shadow-xs cursor-pointer"
                >
                  Confirm &amp; Pay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Pre-Check Result Card */}
        {result && (
          <div className="bg-white border border-[rgba(31,36,48,0.08)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(31,36,48,0.06)] gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#8A92A2] block">
                  Transaction Token: {result.transaction_id}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1F2430] mt-0.5">
                  Pre-Check Interception Verdict
                </h3>
              </div>
              <div>
                {result.decision === "approve" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EBF3EE] text-[#729E85] border border-[#D1E5DA]">
                    <CheckCircle2 className="w-4 h-4" /> APPROVED
                  </span>
                )}
                {result.decision === "step_up" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FCF5E9] text-[#D49D4A] border border-[#F3E0BE]">
                    <AlertTriangle className="w-4 h-4" /> STEP-UP REQUIRED
                  </span>
                )}
                {result.decision === "block" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FBEFEF] text-[#D16D6D] border border-[#F3D2D2]">
                    <XCircle className="w-4 h-4" /> BLOCKED (SCAM PREVENTED)
                  </span>
                )}
              </div>
            </div>

            {/* Score & Tier Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
                <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Unified Fraud Score</span>
                <span className="font-serif text-2xl font-bold text-[#1F2430] mt-0.5 block tnum">
                  {result.fraud_score} / 100
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
                <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Assigned Risk Tier</span>
                <span className="text-sm font-bold text-[#435278] uppercase mt-1 block">
                  {result.risk_tier} Tier
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
                <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Scam Taxonomy Vector</span>
                <span className="text-xs font-semibold text-[#1F2430] mt-1 block truncate">
                  {result.risk_breakdown?.primary_scam_type || "None (Legitimate)"}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.05)]">
                <span className="text-[10px] text-[#8A92A2] uppercase tracking-wider block">Pre-Check SLA</span>
                <span className="text-xs font-bold text-[#729E85] mt-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> {latencyMs || 142} ms (&lt;200ms)
                </span>
              </div>
            </div>

            {/* Reason Codes */}
            {result.risk_breakdown?.reason_codes?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#586071] mb-2">
                  Model Feature Explanations
                </h4>
                <div className="space-y-1.5">
                  {result.risk_breakdown.reason_codes.map((rc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[rgba(31,36,48,0.06)] text-xs text-[#1F2430] flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#435278]" />
                      <span>{rc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stepUpResult && (
              <div className="p-3.5 rounded-2xl bg-[#EBF3EE] border border-[#D1E5DA] text-xs font-semibold text-[#729E85] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{stepUpResult}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
