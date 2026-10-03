"""
SentinelIQ – Loan Repayment Risk & Early Warning Engine (FR3).
Mathematical formulations:
  1. EMI-to-Income: R_EMI = sum(EMI_i) / I_verified. Flag if >= 0.40
  2. DPD Buckets: 0, 1-30, 30-60, 60+
  3. Late Velocity: V_late over 3m and 6m
  4. Income Dynamics: Delta_I = (I_trailing3m - I_current) / I_trailing3m. Flag if > 0.20
  5. Spending Spike: S_spend = E_current / E_prior
  6. Debt Stress: U_credit = Balance / Limit, B_liquid = I_current - E_total - sum(EMI)
  7. Runway: Runway_months = B_liquid / (|min(0, Net Cash Flow)| + eps)
  8. Fraud Linkage: S_repayment = f(..., L_fraud)
Categorization:
  - Healthy: Score < 30
  - Watch: 30 <= Score < 55
  - Stressed: 55 <= Score < 80
  - Default-Risk: Score >= 80
"""

from datetime import datetime, timezone
from typing import Any
from app.schemas.loan import CustomerCreditProfile, LoanRiskMetrics, LoanRiskSummary


def calculate_loan_risk(
    verified_income: float,
    total_emis: float,
    dpd_days: int,
    late_count_3m: int,
    late_count_6m: int,
    trailing_avg_income: float,
    current_income: float,
    expenses_current: float,
    expenses_prior: float,
    credit_balance: float,
    credit_limit: float,
    fraud_losses: float = 0.0,
    loan_id: str = "LOAN-DEMO-01",
    customer_id: str = "CUST-001",
) -> LoanRiskMetrics:
    # 1. R_EMI
    r_emi = total_emis / max(1.0, verified_income)

    # 2. DPD Bucket
    if dpd_days == 0:
        dpd_bucket = "0"
    elif dpd_days <= 30:
        dpd_bucket = "1-30"
    elif dpd_days <= 60:
        dpd_bucket = "30-60"
    else:
        dpd_bucket = "60+"

    # 3. Income Trend Dynamics Delta_I
    if trailing_avg_income > 0:
        income_delta = (trailing_avg_income - current_income) / trailing_avg_income
    else:
        income_delta = 0.0

    # 4. Spending Spike
    spending_spike = expenses_current / max(1.0, expenses_prior)

    # 5. Debt Stress & Liquid Balance
    credit_util = credit_balance / max(1.0, credit_limit)
    liquid_balance = current_income - expenses_current - total_emis
    net_cash_flow = current_income - expenses_current - total_emis

    # 6. Runway in months
    burn = abs(min(0.0, net_cash_flow)) + 1e-4
    runway_months = max(0.0, round(liquid_balance / burn, 1)) if liquid_balance > 0 else 0.0

    # 7. Multi-component Risk Score (0 - 100 scale)
    score_components = []

    # EMI to Income contribution (up to 30 pts)
    if r_emi >= 0.50:
        score_components.append(30.0)
    elif r_emi >= 0.40:
        score_components.append(20.0)
    elif r_emi >= 0.30:
        score_components.append(10.0)

    # DPD contribution (up to 30 pts)
    if dpd_days > 60:
        score_components.append(30.0)
    elif dpd_days > 30:
        score_components.append(20.0)
    elif dpd_days > 0:
        score_components.append(10.0)

    # Late payment velocity (up to 15 pts)
    score_components.append(min(15.0, late_count_3m * 5.0))

    # Income shock delta (up to 15 pts)
    if income_delta > 0.20:
        score_components.append(15.0)
    elif income_delta > 0.10:
        score_components.append(8.0)

    # Spending spike / debt stress (up to 10 pts)
    if spending_spike > 1.4 or credit_util > 0.8:
        score_components.append(10.0)

    # Fraud-to-Credit Loss Linkage (L_fraud)
    if fraud_losses > 0:
        # Confirmed fraud directly strains liquid reserves and credit score
        fraud_stress = min(20.0, (fraud_losses / max(1.0, current_income)) * 15.0)
        score_components.append(fraud_stress)

    raw_score = sum(score_components)
    final_score = round(min(100.0, max(0.0, raw_score)), 2)

    # Categorization
    if final_score < 30.0:
        risk_tier = "healthy"
    elif final_score < 55.0:
        risk_tier = "watch"
    elif final_score < 80.0:
        risk_tier = "stressed"
    else:
        risk_tier = "default_risk"

    return LoanRiskMetrics(
        loan_id=loan_id,
        customer_id=customer_id,
        repayment_risk_score=final_score,
        risk_tier=risk_tier,
        emi_to_income_ratio=round(r_emi, 3),
        dpd_bucket=dpd_bucket,
        late_payment_count_3m=late_count_3m,
        late_payment_count_6m=late_count_6m,
        income_trend_delta=round(income_delta, 3),
        spending_spike_ratio=round(spending_spike, 2),
        credit_utilization=round(credit_util, 3),
        new_credit_lines_60d=1 if credit_util > 0.75 else 0,
        liquid_balance_post_emi=round(liquid_balance, 2),
        net_cash_flow=round(net_cash_flow, 2),
        runway_months=runway_months,
        fraud_loss_amount=fraud_losses,
        calculated_at=datetime.now(timezone.utc),
    )


class LoanRiskService:
    @staticmethod
    def get_customer_loans(customer_id: str) -> LoanRiskSummary:
        # Demonstration profile with calculated metrics
        metric = calculate_loan_risk(
            verified_income=85000.0,
            total_emis=38000.0,  # 44% EMI ratio
            dpd_days=35,         # DPD 30-60
            late_count_3m=2,
            late_count_6m=3,
            trailing_avg_income=90000.0,
            current_income=72000.0,  # 20% income drop
            expenses_current=32000.0,
            expenses_prior=24000.0,
            credit_balance=75000.0,
            credit_limit=90000.0,    # 83% credit util
            fraud_losses=15000.0,    # Linked fraud loss
            loan_id="LOAN-IND-8902",
            customer_id=customer_id,
        )

        return LoanRiskSummary(
            customer_id=customer_id,
            total_loans=1,
            total_outstanding=450000.0,
            aggregate_risk_score=metric.repayment_risk_score,
            risk_tier=metric.risk_tier,
            loans=[metric],
        )

    @staticmethod
    def get_credit_profile(customer_id: str) -> CustomerCreditProfile:
        summary = LoanRiskService.get_customer_loans(customer_id)
        m = summary.loans[0]
        return CustomerCreditProfile(
            customer_id=customer_id,
            verified_monthly_income=85000.0,
            total_emi_obligations=38000.0,
            emi_to_income_ratio=m.emi_to_income_ratio,
            dpd_worst=m.dpd_bucket,
            total_late_3m=m.late_payment_count_3m,
            income_trend=m.income_trend_delta,
            spending_spike=m.spending_spike_ratio,
            credit_utilization=m.credit_utilization,
            liquid_balance=m.liquid_balance_post_emi,
            runway_months=m.runway_months,
            overall_risk_score=m.repayment_risk_score,
            risk_tier=m.risk_tier,
        )
