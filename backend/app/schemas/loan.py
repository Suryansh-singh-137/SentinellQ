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
