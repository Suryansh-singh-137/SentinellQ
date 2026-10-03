"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { precheckPayment, confirmStepUp, PrecheckResponse } from "@/lib/api";

export default function ShopCheckoutPage() {
  const [amount, setAmount] = useState<number>(1250);
  const [channel, setChannel] = useState<string>("upi");
  const [customerId, setCustomerId] = useState<string>("CUST-001");
  const [merchantId, setMerchantId] = useState<string>("MERCHANT-SWIGGY-VERIFIED");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("dev-fp-safari-mac-01");
  const [beneficiaryId, setBeneficiaryId] = useState<string>("PAYEE-ESTABLISHED");

  const [loading, setLoading] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [result, setResult] = useState<PrecheckResponse | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>("");
  const [stepUpResult, setStepUpResult] = useState<string | null>(null);

  // Quick preset loader
  const applyPreset = (tier: "low" | "medium" | "high") => {
    if (tier === "low") {
      setAmount(450);
      setChannel("upi");
      setCustomerId("CUST-001");
      setMerchantId("MERCHANT-SWIGGY-VERIFIED");
      setDeviceFingerprint("dev-fp-safari-mac-01");
      setBeneficiaryId("PAYEE-ESTABLISHED");
    } else if (tier === "medium") {
      setAmount(7500);
      setChannel("card");
      setCustomerId("CUST-001");
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2430] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#586071] hover:text-[#1F2430]">
            <ArrowLeft className="w-4 h-4" /> Back to SentinelIQ Home
          </Link>
          <Link
            href="/analyst"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#435278] text-white text-xs font-medium hover:bg-[#344161]"
          >
            Open Analyst Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#435278] bg-[#EEF2F6] px-2.5 py-1 rounded-full">
                FR1 Real-Time Verification
              </span>
              <h1 className="text-2xl font-bold mt-2 text-[#1F2430]">Pre-Checkout Payment Interceptor</h1>
              <p className="text-sm text-[#586071]">
                Intercepts transactions via synchronous <code className="text-[#435278] bg-[#F1F3F5] px-1.5 py-0.5 rounded">/payments/precheck</code> before Juspay session initialization.
              </p>
            </div>
            {latencyMs !== null && (
              <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-[#16A34A]" />
                <span className="text-xs font-semibold text-[#16A34A]">Latency: {latencyMs} ms (SLA &lt; 200ms)</span>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="mt-6 pt-4 border-t border-[#F1F3F5] flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#6B7280]">Simulate Scenario:</span>
            <button
              onClick={() => applyPreset("low")}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
            >
              🟢 Low Risk (&lt;40)
            </button>
            <button
              onClick={() => applyPreset("medium")}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]"
            >
              🟡 Medium Risk (OTP Step-Up)
            </button>
            <button
              onClick={() => applyPreset("high")}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]"
            >
              🔴 High Risk (Session Block)
            </button>
          </div>
        </div>

        {/* Transaction Input Form */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">Transaction Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#4B5563]">Amount (₹ INR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-[#435278]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4B5563]">Payment Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm bg-white focus:outline-[#435278]"
              >
                <option value="upi">UPI (Instant Rails)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="wallet">Digital Wallet</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#4B5563]">Customer ID</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-[#435278]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4B5563]">Target Merchant ID</label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-[#435278]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4B5563]">Device Fingerprint Flag</label>
              <input
                type="text"
                value={deviceFingerprint}
                onChange={(e) => setDeviceFingerprint(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-[#435278]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4B5563]">Beneficiary Payee ID</label>
              <input
                type="text"
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-[#435278]"
              />
            </div>
          </div>

          <button
            onClick={handlePrecheck}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#435278] hover:bg-[#344161] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? "Evaluating AI Risk Models..." : `Execute Pre-Checkout Check (₹${amount.toLocaleString()})`}
          </button>
        </div>

        {/* Step-Up Challenge Modal */}
        {stepUpOpen && result && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-[#E5E7EB] space-y-4">
              <div className="flex items-center gap-3 text-[#D97706]">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-semibold text-lg text-[#1F2430]">Step-Up Authorization Required</h3>
              </div>
              <p className="text-xs text-[#4B5563]">
                {result.step_up_message || "Additional security confirmation is required before payment authorization."}
              </p>
              {result.step_up_type === "otp" && (
                <div>
                  <label className="text-xs font-medium text-[#374151]">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-center font-mono text-lg tracking-widest"
                  />
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleStepUpAction(false)}
                  className="flex-1 py-2 rounded-lg border border-[#D1D5DB] text-xs font-medium text-[#374151] hover:bg-[#F3F4F6]"
                >
                  Cancel / Abort
                </button>
                <button
                  onClick={() => handleStepUpAction(true)}
                  className="flex-1 py-2 rounded-lg bg-[#435278] text-white text-xs font-medium hover:bg-[#344161]"
                >
                  Confirm & Authorize
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Precheck Decision Card */}
        {result && (
          <div
            className={`border rounded-2xl p-6 shadow-xs transition-all ${
              result.decision === "approve"
                ? "bg-[#F0FDF4] border-[#BBF7D0]"
                : result.decision === "step_up"
                ? "bg-[#FFFBEB] border-[#FDE68A]"
                : "bg-[#FEF2F2] border-[#FECACA]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {result.decision === "approve" && <ShieldCheck className="w-8 h-8 text-[#16A34A]" />}
                {result.decision === "step_up" && <AlertTriangle className="w-8 h-8 text-[#D97706]" />}
                {result.decision === "block" && <ShieldAlert className="w-8 h-8 text-[#DC2626]" />}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#1F2430] uppercase">Decision: {result.decision}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        result.risk_tier === "low"
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : result.risk_tier === "medium"
                          ? "bg-[#FEF3C7] text-[#92400E]"
                          : "bg-[#FEE2E2] text-[#991B1B]"
                      }`}
                    >
                      {result.risk_tier} Risk (Score: {result.fraud_score}/100)
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] mt-1 font-mono">Transaction ID: {result.transaction_id}</p>
                </div>
              </div>
            </div>

            {/* Session Token for Approved */}
            {result.session_token && (
              <div className="mt-4 p-3 bg-white/80 rounded-xl border border-[#BBF7D0]">
                <span className="text-[11px] font-semibold text-[#166534] uppercase tracking-wider block">
                  Juspay Payment Gateway Session Token:
                </span>
                <code className="text-xs text-[#15803D] font-mono break-all">{result.session_token}</code>
              </div>
            )}

            {/* Block message */}
            {result.block_message && (
              <div className="mt-4 p-3 bg-white/80 rounded-xl border border-[#FECACA]">
                <p className="text-xs font-semibold text-[#991B1B]">{result.block_message}</p>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Investigation case opened in Analyst Queue and real-time alert dispatched to <code className="text-[#DC2626]">/ws/alerts</code>.
                </p>
              </div>
            )}

            {/* Step-up Result */}
            {stepUpResult && (
              <div className="mt-4 p-3 bg-white/80 rounded-xl border border-[#FDE68A]">
                <p className="text-xs font-semibold text-[#92400E]">{stepUpResult}</p>
              </div>
            )}

            {/* Explainability Breakdown */}
            <div className="mt-4 pt-4 border-t border-black/5">
              <h4 className="text-xs font-semibold text-[#374151] uppercase mb-2">Plain-English Explainability Reasons:</h4>
              <ul className="space-y-1">
                {result.risk_breakdown.reason_codes.map((reason, idx) => (
                  <li key={idx} className="text-xs text-[#4B5563] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#435278]" /> {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
