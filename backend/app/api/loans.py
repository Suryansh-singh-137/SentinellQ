"""
SentinelIQ – Loans API Routes (FR3).
Endpoints:
  - GET /loans/customers/list
  - GET /loans/{customer_id}
  - GET /loans/{customer_id}/credit-profile
  - POST /loans/calculate
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.loan import (
    CustomerCreditProfile,
    LoanRiskMetrics,
    LoanRiskSummary,
    RestructureRequest,
    RestructureResponse,
)
from app.services.loan.service import LoanRiskService, calculate_loan_risk
from app.services.loan.data_loader import list_all_customer_aliases, get_risk_row, is_data_loaded

router = APIRouter(prefix="/loans", tags=["Loan Risk & Early Warning"])


@router.get("/customers/list")
async def list_customers():
    """Returns all available customer aliases with names and risk stages for the UI preset buttons."""
    aliases = list_all_customer_aliases()
    customers = []
    for entry in aliases:
        risk = get_risk_row(entry["uuid"])
        stage = risk.get("stage", "Unknown") if risk else "Unknown"
        customers.append({
            "id": entry["alias"],
            "name": entry["name"],
            "stage": stage,
            "label": f"{entry['name']} ({stage})",
        })
    return {"customers": customers, "total": len(customers), "data_loaded": is_data_loaded()}


class LoanCalculationRequest(BaseModel):
    customer_id: str = "CUST-001"
    verified_income: float = 75000.0
    total_emis: float = 35000.0
    dpd_days: int = 20
    late_count_3m: int = 1
    late_count_6m: int = 2
    trailing_avg_income: float = 80000.0
    current_income: float = 65000.0
    expenses_current: float = 30000.0
    expenses_prior: float = 24000.0
    credit_balance: float = 50000.0
    credit_limit: float = 80000.0
    fraud_losses: float = 0.0


@router.get("/{customer_id}", response_model=LoanRiskSummary)
async def get_customer_loans(customer_id: str):
    """Retrieves loan obligations and calculated repayment risk metrics for a customer."""
    return LoanRiskService.get_customer_loans(customer_id)


@router.get("/{customer_id}/credit-profile", response_model=CustomerCreditProfile)
async def get_customer_credit_profile(customer_id: str):
    """Retrieves comprehensive 360-degree credit distress profile."""
    return LoanRiskService.get_credit_profile(customer_id)


@router.post("/{customer_id}/restructure", response_model=RestructureResponse)
async def restructure_customer_loan(customer_id: str, payload: RestructureRequest = RestructureRequest()):
    """Executes loan restructuring by extending tenure and lowering monthly EMI."""
    return LoanRiskService.restructure_loan(customer_id, payload.additional_tenure_months)



@router.post("/calculate", response_model=LoanRiskMetrics)
async def calculate_risk(payload: LoanCalculationRequest):
    """Executes dynamic loan repayment risk evaluation using FR3 quantitative formulas."""
    return calculate_loan_risk(
        verified_income=payload.verified_income,
        total_emis=payload.total_emis,
        dpd_days=payload.dpd_days,
        late_count_3m=payload.late_count_3m,
        late_count_6m=payload.late_count_6m,
        trailing_avg_income=payload.trailing_avg_income,
        current_income=payload.current_income,
        expenses_current=payload.expenses_current,
        expenses_prior=payload.expenses_prior,
        credit_balance=payload.credit_balance,
        credit_limit=payload.credit_limit,
        fraud_losses=payload.fraud_losses,
        customer_id=payload.customer_id,
    )
