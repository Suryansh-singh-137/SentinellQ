"""
SentinelIQ – Loan risk schemas.
"""

from datetime import datetime

from pydantic import BaseModel


class LoanRiskMetrics(BaseModel):
    """Computed feature store snapshot for a single customer loan."""
    loan_id: str
    customer_id: str
    repayment_risk_score: float
    risk_tier: str  # healthy, watch, stressed, default_risk
    emi_to_income_ratio: float
    dpd_bucket: str
    late_payment_count_3m: int
    late_payment_count_6m: int
    income_trend_delta: float
    spending_spike_ratio: float
    credit_utilization: float
    new_credit_lines_60d: int
    liquid_balance_post_emi: float
    net_cash_flow: float
    runway_months: float
    fraud_loss_amount: float
    calculated_at: datetime


class LoanRiskSummary(BaseModel):
    customer_id: str
    total_loans: int
    total_outstanding: float
    aggregate_risk_score: float
    risk_tier: str
    loans: list[LoanRiskMetrics]


class LoanListResponse(BaseModel):
    loans: list[LoanRiskMetrics]
    total: int


class CustomerCreditProfile(BaseModel):
    customer_id: str
    verified_monthly_income: float
    total_emi_obligations: float
    emi_to_income_ratio: float
    dpd_worst: str
    total_late_3m: int
    income_trend: float
    spending_spike: float
    credit_utilization: float
    liquid_balance: float
    runway_months: float
    overall_risk_score: float
    risk_tier: str
    # Extended UI-facing fields for CreditRiskTab
    customer_name: str | None = None
    stage: str | None = None
    late_payment_count: int | None = None
    net_cash_flow: float | None = None
    repayment_score: float | None = None
    cash_runway_months: float | None = None
    credit_utilization_pct: float | None = None
    spending_spike_flag: bool | None = None
    recent_scam_loss_flag: bool | None = None
    total_scam_loss: float | None = None

    # Trend history & loan specifics
    emi_trend_history: list[dict] | None = None
    loan_principal: float | None = None
    loan_interest_rate: float | None = None
    loan_tenure_months: int | None = None
    loan_outstanding_balance: float | None = None

    # Proactive Restructuring proposal fields
    restructure_eligible: bool | None = None
    suggested_tenure_extension_months: int | None = None
    projected_restructured_emi: float | None = None
    projected_new_emi_ratio: float | None = None
    restructure_rationale: str | None = None


class RestructureRequest(BaseModel):
    additional_tenure_months: int = 12


class RestructureResponse(BaseModel):
    success: bool
    customer_id: str
    message: str
    previous_emi: float
    new_emi: float
    previous_tenure_months: int
    new_tenure_months: int
    previous_emi_ratio: float
    new_emi_ratio: float
    previous_stage: str
    new_stage: str
    profile: CustomerCreditProfile

