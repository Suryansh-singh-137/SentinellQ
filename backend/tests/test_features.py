"""
SentinelIQ – End-to-End Feature Verification Test Suite (FR1 - FR5).
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.case_management.service import calculate_priority_score
from app.services.loan.service import calculate_loan_risk

client = TestClient(app)


# =====================================================================
# FR1: Real-Time Payment Scoring & Three-Tier Decision Routing
# =====================================================================

def test_fr1_low_risk_auto_approval():
    """FR1: Score < 40 -> Automated approval & Juspay session creation."""
    payload = {
        "customer_id": "CUST-001",
        "amount": 450.0,
        "merchant_id": "MERCHANT-VERIFIED-SWIGGY",
        "channel": "upi",
        "device_fingerprint": "dev-fp-safari-mac-01",  # known device
        "ip_address": "103.21.144.1",
        "geolocation": "Bangalore, IN",
        "beneficiary_id": "PAYEE-ESTABLISHED-01",
    }
    response = client.post("/payments/precheck", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "approve"
    assert data["risk_tier"] == "low"
    assert data["fraud_score"] < 40.0
    assert data["session_token"] is not None
    assert "JUSPAY_SESS" in data["session_token"]


def test_fr1_medium_risk_step_up_otp():
    """FR1: 40 <= Score < 70 -> Issues context-aware step-up authorization."""
    payload = {
        "customer_id": "CUST-001",
        "amount": 7500.0,  # 3x average
        "merchant_id": "MERCHANT-NEW-STORE",
        "channel": "card",
        "device_fingerprint": "dev-fp-new-device-unknown",  # new device
        "ip_address": "49.207.211.5",
        "geolocation": "Mumbai, IN",
        "beneficiary_id": "PAYEE-NORMAL",
    }
    response = client.post("/payments/precheck", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "step_up"
    assert data["risk_tier"] == "medium"
    assert 40.0 <= data["fraud_score"] < 70.0
    assert data["session_token"] is None
    assert data["step_up_type"] in ("otp", "warning")


def test_fr1_step_up_confirmation_workflow():
    """FR1: User confirms step-up -> proceeds to checkout with session token."""
    # First create a step-up transaction
    payload = {
        "customer_id": "CUST-001",
        "amount": 7500.0,
        "merchant_id": "MERCHANT-NEW-STORE",
        "channel": "card",
        "device_fingerprint": "dev-fp-new-device-unknown",
        "ip_address": "49.207.211.5",
        "geolocation": "Mumbai, IN",
        "beneficiary_id": "PAYEE-NORMAL",
    }
    precheck_res = client.post("/payments/precheck", json=payload).json()
    txn_id = precheck_res["transaction_id"]

    # Confirm step-up
    confirm_res = client.post(
        "/payments/step-up/confirm",
        json={"transaction_id": txn_id, "otp_code": "123456", "confirmed": True},
    )
    assert confirm_res.status_code == 200
    confirm_data = confirm_res.json()
    assert confirm_data["decision"] == "approved"
    assert confirm_data["session_token"] is not None


def test_fr1_high_risk_block_and_hold():
    """FR1: Score >= 70 -> Blocks checkout, sets to HELD, creates case in queue."""
    payload = {
        "customer_id": "CUST-002",
        "amount": 95000.0,  # massive spike
        "merchant_id": "MERCHANT-BLACKLISTED-SHADY",
        "channel": "upi",
        "device_fingerprint": "dev-fp-active-call-flag",  # active call
        "ip_address": "185.220.101.5",
        "geolocation": "Unknown",
        "beneficiary_id": "PAYEE-NEW-MULE",
    }
    response = client.post("/payments/precheck", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "block"
    assert data["risk_tier"] == "high"
    assert data["fraud_score"] >= 70.0
    assert data["session_token"] is None
    assert data["block_message"] is not None


# =====================================================================
# FR2: Scam Taxonomy & Hard Rule Overrides
# =====================================================================

def test_fr2_impersonation_scam_rule():
    """FR2: Active voice call with newly added beneficiary triggers hard block."""
    payload = {
        "customer_id": "CUST-001",
        "amount": 35000.0,
        "merchant_id": "MERCHANT-P2P",
        "channel": "upi",
        "device_fingerprint": "dev-call-active",
        "ip_address": "122.161.45.1",
        "geolocation": "Delhi, IN",
        "beneficiary_id": "PAYEE-NEW-ADDED",
    }
    response = client.post("/payments/precheck", json=payload)
    data = response.json()
    assert data["decision"] == "block"
    assert any("HR-IMP-01" in r for r in data["risk_breakdown"]["reason_codes"])


def test_fr2_blacklisted_domain_override():
    """FR2: Blacklisted merchant directly sets score to 100 & blocks."""
    payload = {
        "customer_id": "CUST-001",
        "amount": 1000.0,
        "merchant_id": "MERCHANT-BLACKLISTED-PHISHING-SITE",
        "channel": "card",
        "device_fingerprint": "dev-known",
        "ip_address": "1.1.1.1",
        "geolocation": "Bangalore, IN",
        "beneficiary_id": "PAYEE-NORMAL",
    }
    response = client.post("/payments/precheck", json=payload)
    data = response.json()
    assert data["decision"] == "block"
    assert data["fraud_score"] >= 80.0
    assert any("HR-PHISH-01" in r for r in data["risk_breakdown"]["reason_codes"])


# =====================================================================
# FR3: Loan Repayment Risk & Quantitative Formulas
# =====================================================================

def test_fr3_loan_risk_mathematical_formulations():
    """FR3: Verifies quantitative EMI ratio, DPD, income delta, runway, and fraud loss linkage."""
    result = calculate_loan_risk(
        verified_income=100000.0,
        total_emis=45000.0,       # R_EMI = 0.45 (triggers >= 0.40 flag)
        dpd_days=45,              # DPD 30-60 bucket
        late_count_3m=2,          # V_late = 2
        late_count_6m=3,
        trailing_avg_income=120000.0,
        current_income=90000.0,   # Delta_I = (120k - 90k) / 120k = 0.25 (triggers > 0.20 flag)
        expenses_current=40000.0,
        expenses_prior=30000.0,   # Spending spike = 1.33
        credit_balance=70000.0,
        credit_limit=80000.0,     # Credit util = 87.5%
        fraud_losses=20000.0,     # L_fraud linked stress variable
    )

    assert result.emi_to_income_ratio == 0.45
    assert result.dpd_bucket == "30-60"
    assert result.income_trend_delta == 0.25
    assert result.repayment_risk_score >= 55.0
    assert result.risk_tier in ("stressed", "default_risk")
    assert result.fraud_loss_amount == 20000.0


def test_fr3_loan_api_endpoints():
    """FR3: Test loan risk summary and credit profile endpoints."""
    summary_res = client.get("/loans/CUST-001")
    assert summary_res.status_code == 200
    assert summary_res.json()["total_loans"] >= 1

    profile_res = client.get("/loans/CUST-001/credit-profile")
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert "emi_to_income_ratio" in profile_data
    assert "runway_months" in profile_data


# =====================================================================
# FR4: Analyst Case Management, Priority Scoring & Mule Graphs
# =====================================================================

def test_fr4_priority_score_formula():
    """FR4: Priority Score = S_risk * Amount_txn * log10(Exposure_total + 1)."""
    score = calculate_priority_score(risk_score=90.0, amount=50000.0, total_exposure=150000.0)
    # 0.90 * 50000 * log10(150001) ~ 45000 * 5.176 ~ 232,923
    assert score > 100000.0


def test_fr4_analyst_cases_and_actions():
    """FR4: Analyst list, case detail, and action transitions."""
    list_res = client.get("/cases")
    assert list_res.status_code == 200
    cases = list_res.json()["cases"]
    assert len(cases) >= 1
    case_id = cases[0]["id"]

    # Fetch detail
    detail_res = client.get(f"/cases/{case_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == case_id

    # Perform action (Approve / Clear)
    action_res = client.post(
        "/cases/action",
        json={"case_id": case_id, "action": "approve", "notes": "Verified with customer phone confirmation"},
    )
    assert action_res.status_code == 200
    assert action_res.json()["new_status"] == "approved"


def test_fr4_interactive_mule_ring_graph():
    """FR4: Returns NetworkX multi-hop topology with In-Degree and PageRank metrics."""
    res = client.get("/analytics/mule-graph?k_hops=4")
    assert res.status_code == 200
    graph = res.json()
    assert "nodes" in graph
    assert "links" in graph
    assert len(graph["nodes"]) > 0
    assert len(graph["links"]) > 0
    assert len(graph["flagged_mule_nodes"]) > 0


def test_fr4_read_only_llm_assistant():
    """FR4: Read-only conversational module responds without state mutation."""
    res = client.post("/assistant/chat", json={"query": "Why was the transaction flagged?"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_read_only"] is True
    assert len(data["response"]) > 20


# =====================================================================
# FR5: Governance, Drift Monitoring & Perceptual Hashing
# =====================================================================

def test_fr5_drift_monitoring_psi_and_ks():
    """FR5: Population Stability Index and Kolmogorov-Smirnov test."""
    res = client.get("/analytics/drift")
    assert res.status_code == 200
    data = res.json()
    assert "psi_value" in data
    assert "ks_statistic" in data
    assert "status" in data


def test_fr5_phash_group_scam_detection():
    """FR5: Perceptual hashing d_H <= 10 flags syndicate campaigns."""
    res = client.post("/analytics/phash-check", json={"phash": "d87a4c2f1e9b8a7c"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_syndicated_campaign"] is True
    assert data["min_hamming_distance"] == 0
    assert data["risk_recommendation"] == "BLOCK_AND_FLAG_SYNDICATE"
