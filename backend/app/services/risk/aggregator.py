"""
SentinelIQ – Risk Aggregator Engine (FR1 & FR2).
Aggregates:
  1. Unsupervised Anomaly Engine (Isolation Forest)
  2. Supervised Scam Classifier (6-Class XGBoost taxonomy)
  3. Deterministic Rules Engine (Hard overrides)

Decision Tiers:
  - Low Risk:    Score < 40  -> "approve"
  - Medium Risk: 40 <= Score < 70 -> "step_up"
  - High Risk:   Score >= 70 -> "block"
"""

from app.ml.anomaly.detector import compute_anomaly_score
from app.ml.fraud.classifier import classify_scam
from app.schemas.risk import (
    AggregatedRiskResult,
    AnomalyResult,
    ScamClassification,
)
from app.services.risk.rules import evaluate_rules


def aggregate_risk(features: dict) -> AggregatedRiskResult:
    # 1. Unsupervised Anomaly Engine
    anomaly_raw = compute_anomaly_score(features)
    anomaly_res = AnomalyResult(
        anomaly_score=anomaly_raw["anomaly_score"],
        is_anomalous=anomaly_raw["is_anomalous"],
        deviation_factors=anomaly_raw["deviation_factors"],
    )

    # 2. Supervised Scam Classifier
    scam_raw = classify_scam(features)
    scam_res = ScamClassification(
        scam_type=scam_raw["scam_type"],
        confidence=scam_raw["confidence"],
        indicators=scam_raw["indicators"],
    )

    # 3. Deterministic Rules Engine
    rules_res = evaluate_rules(features)

    # 4. Aggregation Formula
    # Base weighted blend: 35% Anomaly + 45% Scam Confidence*100 + 20% Rules
    scam_numeric_score = scam_res.confidence * 100.0
    weighted_score = (
        0.35 * anomaly_res.anomaly_score
        + 0.45 * scam_numeric_score
        + 0.20 * rules_res.rules_score
    )

    # Apply hard rule overrides
    if rules_res.hard_block:
        final_score = max(weighted_score, rules_res.rules_score, 80.0)
    elif rules_res.force_step_up:
        final_score = max(weighted_score, 50.0)
    else:
        final_score = weighted_score

    final_score = round(min(100.0, max(0.0, final_score)), 2)

    # 5. Three-Tier Routing Protocol
    if final_score < 40.0:
        risk_tier = "low"
        decision = "approve"
    elif final_score < 70.0:
        risk_tier = "medium"
        decision = "step_up"
    else:
        risk_tier = "high"
        decision = "block"

    # 6. Plain-English Explainability Reason Codes
    reason_codes: list[str] = []
    reason_codes.extend(rules_res.triggered_rules)
    reason_codes.extend(anomaly_res.deviation_factors)
    reason_codes.extend(scam_res.indicators)

    if not reason_codes:
        reason_codes.append("Standard transaction profile within normal behavioral thresholds.")

    # 7. SHAP Feature Attribution Vector (simulated attribution mapping)
    shap_values = {
        "amount_deviation": round((features.get("amount", 0) / max(1.0, features.get("avg_txn_amount", 1000))) * 0.2, 4),
        "velocity_frequency": round(features.get("txn_count_1h", 0) * 0.05, 4),
        "device_anomaly": 0.25 if features.get("is_new_device") else -0.1,
        "beneficiary_risk": 0.35 if features.get("is_mule_flagged") or features.get("beneficiary_age_minutes", 9999) < 10 else -0.05,
        "merchant_reputation": round((100.0 - features.get("merchant_reputation", 50)) / 100.0 * 0.15, 4),
    }

    return AggregatedRiskResult(
        final_score=final_score,
        risk_tier=risk_tier,
        decision=decision,
        anomaly=anomaly_res,
        scam=scam_res,
        rules=rules_res,
        reason_codes=reason_codes[:5],  # top 5 concise reasons
        shap_values=shap_values,
    )
