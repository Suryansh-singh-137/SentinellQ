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
        """
        Retrieves loan obligations and computed risk metrics for a customer.
        Sources data from generated CSVs or synthesized profiles via data_loader.
        """
        from app.services.loan.data_loader import (
            get_customer_row, get_loan_rows, get_risk_row, get_income_row,
            get_customer_alias, is_data_loaded
        )

        customer = get_customer_row(customer_id)
        loans = get_loan_rows(customer_id)
        risk = get_risk_row(customer_id)
        income = get_income_row(customer_id)

        if customer and loans:
            metrics = []
            total_outstanding = 0.0
            for loan in loans:
                income_val = float(customer.get("monthly_income", 50000.0))
                emi_val = float(loan.get("emi", 0.0))
                dpd_days = int(risk.get("dpd_days", 0)) if risk else 0
                late_count = int(risk.get("late_payment_count", 0)) if risk else 0
                income_drop = float(risk.get("income_trend_drop_pct", 0)) if risk else 0.0
                current_income = float(income.get("current_monthly_income", income_val)) if income else income_val
                spike_flag = bool(risk.get("spending_spike_flag", False)) if risk else False

                net_cf = float(risk.get("net_cash_flow", 0)) if risk else 0.0
                expenses_est = max(1.0, current_income - emi_val - net_cf)
                expenses_prior = expenses_est / (1.5 if spike_flag else 1.0)

                scam_loss = float(risk.get("total_scam_loss", 0)) if risk else 0.0
                credit_util_pct = float(risk.get("credit_utilization_pct", 50)) if risk else 50.0
                credit_limit = max(1.0, income_val * 1.2)
                credit_balance = credit_limit * (credit_util_pct / 100.0)

                metric = calculate_loan_risk(
                    verified_income=income_val,
                    total_emis=emi_val,
                    dpd_days=dpd_days,
                    late_count_3m=min(late_count, 6),
                    late_count_6m=late_count,
                    trailing_avg_income=income_val,
                    current_income=current_income,
                    expenses_current=expenses_est,
                    expenses_prior=expenses_prior,
                    credit_balance=credit_balance,
                    credit_limit=credit_limit,
                    fraud_losses=scam_loss,
                    loan_id=loan.get("loan_id", f"LOAN-{customer_id}"),
                    customer_id=customer_id,
                )
                metrics.append(metric)
                total_outstanding += float(loan.get("outstanding_balance", 0))

            worst_metric = max(metrics, key=lambda m: m.repayment_risk_score)
            return LoanRiskSummary(
                customer_id=get_customer_alias(customer_id),
                total_loans=len(metrics),
                total_outstanding=round(total_outstanding, 2),
                aggregate_risk_score=worst_metric.repayment_risk_score,
                risk_tier=worst_metric.risk_tier,
                loans=metrics,
            )

        # Fallback if no data loaded
        metric = calculate_loan_risk(
            verified_income=75000.0,
            total_emis=30000.0,
            dpd_days=15,
            late_count_3m=1,
            late_count_6m=2,
            trailing_avg_income=80000.0,
            current_income=70000.0,
            expenses_current=28000.0,
            expenses_prior=24000.0,
            credit_balance=55000.0,
            credit_limit=80000.0,
            fraud_losses=0.0,
            loan_id=f"LOAN-CALC-{customer_id}",
            customer_id=customer_id,
        )
        return LoanRiskSummary(
            customer_id=customer_id,
            total_loans=1,
            total_outstanding=350000.0,
            aggregate_risk_score=metric.repayment_risk_score,
            risk_tier=metric.risk_tier,
            loans=[metric],
        )

    @staticmethod
    def get_credit_profile(customer_id: str) -> CustomerCreditProfile:
        """
        Builds a comprehensive 360-degree credit distress profile.
        Reads per-customer data from generated CSVs and populates all
        extended fields required by the frontend CreditRiskTab.
        """
        from app.services.loan.data_loader import (
            get_customer_row, get_loan_rows, get_risk_row, get_income_row,
            get_customer_alias, is_data_loaded
        )

        summary = LoanRiskService.get_customer_loans(customer_id)
        m = summary.loans[0]
        loans = get_loan_rows(customer_id)
        loan = loans[0] if loans else {}

        customer = get_customer_row(customer_id)
        risk = get_risk_row(customer_id)
        income = get_income_row(customer_id)

        customer_name = customer.get("name") if customer else None
        stage = risk.get("stage") if risk else None
        late_payment_count = int(risk.get("late_payment_count", m.late_payment_count_6m)) if risk else m.late_payment_count_6m
        net_cash_flow = float(risk.get("net_cash_flow", m.net_cash_flow)) if risk else m.net_cash_flow
        repayment_score = float(risk.get("repayment_score", 50)) if risk else round(max(0, 100 - m.repayment_risk_score), 1)
        cash_runway_months = float(risk.get("cash_runway_months", m.runway_months)) if risk else m.runway_months
        credit_utilization_pct = float(risk.get("credit_utilization_pct", round(m.credit_utilization * 100, 1))) if risk else round(m.credit_utilization * 100, 1)
        spending_spike_flag = bool(risk.get("spending_spike_flag", m.spending_spike_ratio > 1.3)) if risk else False
        recent_scam_loss_flag = bool(risk.get("recent_scam_loss_flag", m.fraud_loss_amount > 0)) if risk else False
        total_scam_loss = float(risk.get("total_scam_loss", m.fraud_loss_amount)) if risk else 0.0

        if customer:
            verified_income = float(customer.get("monthly_income", 50000.0))
        elif income:
            verified_income = float(income.get("base_monthly_income", 50000.0))
        else:
            verified_income = 50000.0

        # Derive stage from risk tier if not set from CSV
        if not stage:
            tier_to_stage = {
                "healthy": "Healthy",
                "watch": "Watch",
                "stressed": "Stressed",
                "default_risk": "Default-risk",
            }
            stage = tier_to_stage.get(m.risk_tier, "Watch")

        # Loan specifics
        loan_principal = float(loan.get("principal", 250000.0))
        loan_interest_rate = float(loan.get("interest_rate", 12.0))
        loan_tenure_months = int(loan.get("tenure_months", 36))
        loan_outstanding_balance = float(loan.get("outstanding_balance", round(loan_principal * 0.65, 2)))
        current_emi = float(loan.get("emi", round(m.emi_to_income_ratio * verified_income, 2)))

        # ── Realistic 6-Month Historical Trajectory ──
        # Computes deterministic trajectory leading up to current ratio
        current_ratio = round(current_emi / max(1.0, verified_income), 3)
        history = []
        labels = ["6m ago", "5m ago", "4m ago", "3m ago", "2m ago", "Last Mo."]

        # Calculate historical progression
        for i, lbl in enumerate(labels):
            months_back = 5 - i
            if months_back == 0:
                h_ratio = current_ratio
            elif recent_scam_loss_flag and months_back <= 2:
                # Scam caused recent jump
                h_ratio = max(0.15, current_ratio - 0.08 * months_back)
            elif stage in ["Stressed", "Default-risk"]:
                # Progressive deterioration
                h_ratio = max(0.18, current_ratio - 0.04 * months_back)
            else:
                # Stable
                h_ratio = max(0.15, current_ratio - 0.01 * (months_back % 2))
            history.append({
                "month": lbl,
                "ratio": round(h_ratio, 3),
            })

        # ── Proactive Restructuring Calculation ──
        restructure_eligible = (current_ratio > 0.40) or (stage in ["Stressed", "Default-risk"]) or recent_scam_loss_flag
        suggested_tenure_ext = 18 if current_ratio > 0.55 else 12
        new_tenure = loan_tenure_months + suggested_tenure_ext
        r_monthly = (loan_interest_rate / 100) / 12
        # Projected EMI
        projected_emi = round(loan_outstanding_balance * r_monthly * (1 + r_monthly) ** new_tenure / ((1 + r_monthly) ** new_tenure - 1), 2)
        projected_ratio = round(projected_emi / max(1.0, verified_income), 3)

        if total_scam_loss > 0:
            restructure_rationale = (
                f"Customer experienced a recent ₹{total_scam_loss:,.0f} fraud drain. "
                f"Extend tenure by {suggested_tenure_ext} months to lower monthly EMI to ₹{projected_emi:,.0f}."
            )
        else:
            restructure_rationale = (
                f"EMI-to-income ratio of {(current_ratio * 100):.1f}% exceeds safe threshold. "
                f"Extend tenure by {suggested_tenure_ext} months to lower monthly EMI to ₹{projected_emi:,.0f}."
            )

        display_alias = get_customer_alias(customer_id)

        return CustomerCreditProfile(
            customer_id=display_alias,
            verified_monthly_income=round(verified_income, 2),
            total_emi_obligations=round(current_emi, 2),
            emi_to_income_ratio=current_ratio,
            dpd_worst=m.dpd_bucket,
            total_late_3m=m.late_payment_count_3m,
            income_trend=m.income_trend_delta,
            spending_spike=m.spending_spike_ratio,
            credit_utilization=m.credit_utilization,
            liquid_balance=m.liquid_balance_post_emi,
            runway_months=cash_runway_months,
            overall_risk_score=m.repayment_risk_score,
            risk_tier=m.risk_tier,
            # Extended UI fields
            customer_name=customer_name or f"Customer {display_alias}",
            stage=stage,
            late_payment_count=late_payment_count,
            net_cash_flow=net_cash_flow,
            repayment_score=repayment_score,
            cash_runway_months=cash_runway_months,
            credit_utilization_pct=credit_utilization_pct,
            spending_spike_flag=spending_spike_flag,
            recent_scam_loss_flag=recent_scam_loss_flag,
            total_scam_loss=total_scam_loss,
            # Trend and specifics
            emi_trend_history=history,
            loan_principal=loan_principal,
            loan_interest_rate=loan_interest_rate,
            loan_tenure_months=loan_tenure_months,
            loan_outstanding_balance=loan_outstanding_balance,
            # Restructuring proposal
            restructure_eligible=restructure_eligible,
            suggested_tenure_extension_months=suggested_tenure_ext,
            projected_restructured_emi=projected_emi,
            projected_new_emi_ratio=projected_ratio,
            restructure_rationale=restructure_rationale,
        )

    @staticmethod
    def restructure_loan(customer_id: str, additional_months: int = 12):
        """
        Executes restructuring on a customer's active loan and returns
        the updated credit distress profile.
        """
        from app.services.loan.data_loader import restructure_customer_loan
        from app.schemas.loan import RestructureResponse

        result = restructure_customer_loan(customer_id, additional_months)
        updated_profile = LoanRiskService.get_credit_profile(customer_id)

        msg = (
            f"Restructure offer successfully executed! Loan tenure extended by {additional_months} months. "
            f"Monthly EMI reduced from ₹{result['previous_emi']:,.2f} to ₹{result['new_emi']:,.2f}. "
            f"EMI ratio dropped from {(result['previous_emi_ratio']*100):.1f}% to {(result['new_emi_ratio']*100):.1f}%."
        )

        return RestructureResponse(
            success=True,
            customer_id=result["customer_id"],
            message=msg,
            previous_emi=result["previous_emi"],
            new_emi=result["new_emi"],
            previous_tenure_months=result["previous_tenure_months"],
            new_tenure_months=result["new_tenure_months"],
            previous_emi_ratio=result["previous_emi_ratio"],
            new_emi_ratio=result["new_emi_ratio"],
            previous_stage=result["previous_stage"],
            new_stage=result["new_stage"],
            profile=updated_profile,
        )

