"""
SentinelIQ – Risk schemas.
"""

from pydantic import BaseModel


class RiskFeatureVector(BaseModel):
    """Internal feature vector passed to ML models."""
    customer_id: str
    amount: float
    channel: str
    device_fingerprint: str
    ip_address: str
    geolocation: str
    beneficiary_id: str
    merchant_id: str

    # Historic velocities (populated by service)
    txn_count_1m: int = 0
    txn_count_5m: int = 0
    txn_count_1h: int = 0
    txn_amount_1h: float = 0.0
    txn_amount_24h: float = 0.0
    avg_txn_amount: float = 0.0
    max_txn_amount: float = 0.0

    # Device context
    is_new_device: bool = False
    device_age_hours: float = 0.0
    device_trust_score: float = 0.5

    # Beneficiary context
    beneficiary_age_minutes: float = 9999.0
    beneficiary_total_txns: int = 0
    is_mule_flagged: bool = False

    # Merchant context
    merchant_reputation: float = 50.0
    merchant_domain_age_days: int = 365
    merchant_is_blacklisted: bool = False
    merchant_flag_rate: float = 0.0

    # Call state / urgency
    is_during_call: bool = False
    is_collect_request: bool = False
    recent_credit_amount: float = 0.0
    minutes_since_credit: float = 9999.0


class ScamClassification(BaseModel):
    scam_type: str
    confidence: float
    indicators: list[str] = []


class AnomalyResult(BaseModel):
    anomaly_score: float
    is_anomalous: bool
    deviation_factors: list[str] = []


class RulesResult(BaseModel):
    rules_score: float
    triggered_rules: list[str] = []
    hard_block: bool = False
    force_step_up: bool = False


class AggregatedRiskResult(BaseModel):
    final_score: float
    risk_tier: str  # "low", "medium", "high"
    decision: str  # "approve", "step_up", "block"
    anomaly: AnomalyResult
    scam: ScamClassification
    rules: RulesResult
    reason_codes: list[str] = []
    shap_values: dict | None = None
