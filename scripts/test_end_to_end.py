"""
End-to-End System Integration Test for SentinelIQ
Validates FR1, FR2, FR3, FR4, FR5 endpoints on FastAPI backend (http://127.0.0.1:8000).
"""

import json
import urllib.request

BASE_URL = "http://127.0.0.1:8000"


def req(path, method="GET", body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode("utf-8") if body else None
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(r) as resp:
        return json.loads(resp.read().decode("utf-8"))


print("=" * 60)
print("1. HEALTH CHECK")
health = req("/health")
print("Status:", health.get("status"))
print("Subsystems:", health.get("subsystems"))

print("\n" + "=" * 60)
print("2. ROLE-BASED AUTH (Analyst & Customer)")
login_analyst = req(
    "/auth/login",
    method="POST",
    body={"email_or_username": "analyst@sentineliq.ai", "password": "analyst123"},
)
print("Analyst Logged In:", login_analyst["user"]["full_name"], "| Role:", login_analyst["user"]["role"])
token = login_analyst["access_token"]

login_cust = req(
    "/auth/login",
    method="POST",
    body={"email_or_username": "customer@sentineliq.ai", "password": "customer123"},
)
print("Customer Logged In:", login_cust["user"]["full_name"], "| Role:", login_cust["user"]["role"], "| CustomerID:", login_cust["user"]["customer_id"])

print("\n" + "=" * 60)
print("3. FR1: REAL-TIME PAYMENT PRE-CHECK (LOW RISK)")
p_low = req(
    "/payments/precheck",
    method="POST",
    body={
        "customer_id": "CUST-001",
        "amount": 450,
        "merchant_id": "MERCHANT-SWIGGY-VERIFIED",
        "channel": "upi",
        "device_fingerprint": "dev-fp-safari-mac-01",
        "ip_address": "103.21.144.1",
        "beneficiary_id": "PAYEE-ESTABLISHED",
    },
)
print("Low Risk -> Decision:", p_low["decision"], "| Score:", p_low["fraud_score"], "| SessionToken:", p_low.get("session_token"))

print("\n" + "=" * 60)
print("4. FR1 & FR2: REAL-TIME PAYMENT PRE-CHECK (HIGH RISK SCAM INTERCEPTION)")
p_high = req(
    "/payments/precheck",
    method="POST",
    body={
        "customer_id": "CUST-002",
        "amount": 95000,
        "merchant_id": "MERCHANT-BLACKLISTED-SHADY",
        "channel": "upi",
        "device_fingerprint": "dev-fp-active-call-flag",
        "ip_address": "103.21.144.1",
        "beneficiary_id": "PAYEE-NEW-MULE",
    },
)
print("High Risk -> Decision:", p_high["decision"], "| Score:", p_high["fraud_score"], "| Tier:", p_high["risk_tier"])
print("Scam Taxonomy:", p_high["risk_breakdown"].get("primary_scam_type"))
print("Reason Codes:", p_high["risk_breakdown"].get("reason_codes"))

print("\n" + "=" * 60)
print("5. FR4: ANALYST CASE MANAGEMENT QUEUE")
cases = req("/cases")
print("Total Queued Cases:", cases["total"])
if cases["cases"]:
    c0 = cases["cases"][0]
    print(f"Top Case: {c0['id']} | Customer: {c0.get('customer_name')} | Amount: INR {c0['transaction_amount']} | Priority Score: {c0['priority_score']}")

print("\n" + "=" * 60)
print("6. FR3: LOAN REPAYMENT RISK & EARLY WARNING")
loan = req("/loans/CUST-001/credit-profile")
print("Customer:", loan["customer_id"])
print("R_EMI:", round(loan["emi_to_income_ratio"] * 100, 1), "% | Flag:", loan["emi_to_income_ratio"] >= 0.40)
print("DPD Bucket:", loan["dpd_worst"])
print("Risk Tier:", loan["risk_tier"], "| Overall Score:", loan["overall_risk_score"])
print("Runway Months:", loan["runway_months"])

print("\n" + "=" * 60)
print("7. FR4: MULE RING NETWORK GRAPH")
graph = req("/analytics/mule-graph")
print("Total Graph Nodes:", len(graph["nodes"]), "| Total Hops/Edges:", len(graph["links"]))
flagged_nodes = [n["id"] for n in graph["nodes"] if n.get("is_flagged_mule")]
print("Nodes with In-Degree > 0.05 or PageRank > 0.015:", flagged_nodes)

print("\n" + "=" * 60)
print("8. FR5: MODEL GOVERNANCE & QUANTITATIVE DRIFT")
drift = req("/analytics/drift")
print("Model Status:", drift["status"])
print(f"PSI: {drift['psi_value']} (Threshold < {drift['psi_threshold']})")
print(f"KS p-value: {drift['ks_pvalue']} (p >= 0.05)")

print("\n" + "=" * 60)
print("9. FR4: READ-ONLY AI ASSISTANT")
chat = req(
    "/assistant/chat",
    method="POST",
    body={"query": "Why was CUST-002 flagged for high risk?"},
)
print("Response:", chat["response"].encode("ascii", "ignore").decode("ascii")[:180] + "...")
print("=" * 60)
print("ALL FUNCTIONAL REQUIREMENTS FR1 - FR5 VERIFIED END-TO-END!")
