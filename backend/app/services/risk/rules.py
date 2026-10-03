"""
SentinelIQ – Deterministic Rules Engine (FR2).
Hard overrides that bypass or modulate ML scores:
1. Voice call active + new beneficiary (< 10m) -> High Risk
2. Blacklisted domain / merchant -> Absolute block (score = 100)
3. Inbound credit within 15 min + outbound collect -> Medium step-up (Fake Refund)
4. Escalating sequential payments to same payee -> Investment Scam flag
5. Identified active mule account node -> Absolute block (score = 100)
6. Inbound collect request without prior history -> Force step-up warning: "This will DEBIT your account"
"""

from app.schemas.risk import RulesResult


def evaluate_rules(features: dict) -> RulesResult:
    triggered_rules: list[str] = []
    rules_score = 0.0
    hard_block = False
    force_step_up = False

    amount = float(features.get("amount", 0))
    avg_amount = float(features.get("avg_txn_amount", 1) or 1)
    amount_ratio = amount / max(1.0, avg_amount)

    # 1. Impersonation: Active call during txn to new payee (< 10 mins)
    is_call = bool(features.get("is_during_call", False))
    bene_age = float(features.get("beneficiary_age_minutes", 9999.0))
    if is_call and bene_age <= 10.0:
        triggered_rules.append("HR-IMP-01: Active voice call with newly added beneficiary (<= 10 mins)")
        rules_score = max(rules_score, 85.0)
        hard_block = True

    # 2. Phishing: Blacklisted merchant domain
    if features.get("merchant_is_blacklisted", False):
        triggered_rules.append("HR-PHISH-01: Target merchant domain is on active global blacklist")
        rules_score = 100.0
        hard_block = True

    # 3. Fake Refund: Collect request following inbound credit in <= 15m
    is_collect = bool(features.get("is_collect_request", False))
    mins_credit = float(features.get("minutes_since_credit", 9999.0))
    recent_credit = float(features.get("recent_credit_amount", 0.0))
    if is_collect and mins_credit <= 15.0 and recent_credit > 0:
        triggered_rules.append(
            f"HR-REFUND-01: Inbound credit (Rs. {recent_credit:.2f}) followed by collect within 15m"
        )
        rules_score = max(rules_score, 55.0)
        force_step_up = True

    # 4. Investment Scam: 3rd sequential payment increment
    bene_txns = int(features.get("beneficiary_total_txns", 0))
    if bene_txns >= 3 and amount_ratio >= 2.0:
        triggered_rules.append("HR-INVEST-01: Dynamic flag escalation on 3rd sequential payment increment")
        rules_score = max(rules_score, 65.0)
        force_step_up = True

    # 5. Mule Account: Active mule node override
    if features.get("is_mule_flagged", False):
        triggered_rules.append("HR-MULE-01: Target beneficiary identified as active mule node")
        rules_score = 100.0
        hard_block = True

    # 6. Payment-Request Scam: Collect from payee with no prior history
    if is_collect and bene_txns == 0:
        triggered_rules.append(
            "HR-COLLECT-01: Unlinked collect request. Enforce warning: 'This will DEBIT your account'"
        )
        rules_score = max(rules_score, 50.0)
        force_step_up = True

    return RulesResult(
        rules_score=round(rules_score, 2),
        triggered_rules=triggered_rules,
        hard_block=hard_block,
        force_step_up=force_step_up,
    )
