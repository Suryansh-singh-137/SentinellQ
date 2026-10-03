"""
SentinelIQ – XGBoost 6-Class Scam Classifier.
Evaluates features against 6 structured scam profiles:
  1. Impersonation
  2. Phishing
  3. Fake Refund
  4. Investment Scam
  5. Mule Account
  6. Payment-Request (Collect) Scam
"""

import logging

logger = logging.getLogger(__name__)

SCAM_TYPES = [
    "impersonation",
    "phishing",
    "fake_refund",
    "investment_scam",
    "mule_account",
    "payment_request",
]


def classify_scam(features: dict) -> dict:
    """
    Classify transaction against 6 scam profiles using rule-based heuristics
    (production: XGBoost multi-class model).

    Returns:
      - scam_type: str (best match)
      - confidence: float 0-1
      - indicators: list[str]
    """
    scores: dict[str, float] = {s: 0.0 for s in SCAM_TYPES}
    indicators: dict[str, list[str]] = {s: [] for s in SCAM_TYPES}

    amount = features.get("amount", 0)
    avg_amount = features.get("avg_txn_amount", 0) or 1
    amount_ratio = amount / avg_amount

    # ── Impersonation ───────────────────────────────────────
    if features.get("is_during_call", False):
        scores["impersonation"] += 0.4
        indicators["impersonation"].append("Active voice call during transaction")
    if features.get("beneficiary_age_minutes", 9999) < 10:
        scores["impersonation"] += 0.3
        indicators["impersonation"].append(
            f"Payee added {features.get('beneficiary_age_minutes', 0):.0f} min ago"
        )
    if amount_ratio > 5:
        scores["impersonation"] += 0.2
        indicators["impersonation"].append(
            f"Amount {amount_ratio:.1f}x historic average"
        )

    # ── Phishing ────────────────────────────────────────────
    if features.get("merchant_is_blacklisted", False):
        scores["phishing"] = 0.95
        indicators["phishing"].append("Merchant domain on blacklist")
    if features.get("merchant_domain_age_days", 365) < 30:
        scores["phishing"] += 0.35
        indicators["phishing"].append(
            f"Merchant domain age: {features.get('merchant_domain_age_days', 0)} days"
        )
    if features.get("merchant_reputation", 50) < 20:
        scores["phishing"] += 0.2
        indicators["phishing"].append("Low merchant reputation score")

    # ── Fake Refund ─────────────────────────────────────────
    if features.get("is_collect_request", False) and features.get("minutes_since_credit", 9999) < 15:
        scores["fake_refund"] += 0.5
        indicators["fake_refund"].append(
            f"Collect request {features.get('minutes_since_credit', 0):.0f} min after credit"
        )
    if features.get("recent_credit_amount", 0) > 0:
        scores["fake_refund"] += 0.2
        indicators["fake_refund"].append(
            f"Recent inbound credit of ₹{features.get('recent_credit_amount', 0):,.2f}"
        )

    # ── Investment Scam ─────────────────────────────────────
    if features.get("beneficiary_total_txns", 0) >= 3 and amount_ratio > 1.5:
        scores["investment_scam"] += 0.3
        indicators["investment_scam"].append(
            "Escalating payments to same payee"
        )
    if amount_ratio > 3:
        scores["investment_scam"] += 0.2
        indicators["investment_scam"].append(
            f"Amount escalation: {amount_ratio:.1f}x"
        )

    # ── Mule Account ────────────────────────────────────────
    if features.get("is_mule_flagged", False):
        scores["mule_account"] = 0.95
        indicators["mule_account"].append("Target account flagged as active mule node")
    txn_1h = features.get("txn_count_1h", 0)
    if txn_1h > 10:
        scores["mule_account"] += 0.3
        indicators["mule_account"].append(
            f"High transaction velocity: {txn_1h} txns/hr"
        )

    # ── Payment-Request (Collect) Scam ──────────────────────
    if features.get("is_collect_request", False):
        scores["payment_request"] += 0.3
        indicators["payment_request"].append("Inbound UPI collect request")
        if features.get("beneficiary_total_txns", 0) == 0:
            scores["payment_request"] += 0.3
            indicators["payment_request"].append(
                "Collect from payee with no prior history"
            )

    # ── Pick best match ─────────────────────────────────────
    best_type = max(scores, key=scores.get)  # type: ignore[arg-type]
    best_confidence = min(1.0, scores[best_type])

    # If no scam signals, return clean
    if best_confidence < 0.1:
        return {
            "scam_type": "none",
            "confidence": 0.0,
            "indicators": [],
        }

    return {
        "scam_type": best_type,
        "confidence": round(best_confidence, 3),
        "indicators": indicators[best_type],
    }
