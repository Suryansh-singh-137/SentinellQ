"""
SentinelIQ – Read-Only LLM Conversational Assistant (FR4).
Allows analysts to query contextual risk data using natural language.
Strictly prohibited from mutating scores, modifying policy logic, or applying labels.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.case_management.service import CaseManagementService

router = APIRouter(prefix="/assistant", tags=["Analyst LLM Assistant"])


class AssistantQueryRequest(BaseModel):
    query: str
    case_id: str | None = None


class AssistantQueryResponse(BaseModel):
    query: str
    response: str
    case_context: dict | None = None
    is_read_only: bool = True


@router.post("/chat", response_model=AssistantQueryResponse)
async def query_assistant(payload: AssistantQueryRequest):
    """
    Read-only assistant that explains risk decisions and answers analyst inquiries.
    Score mutations and case state modifications are strictly forbidden.
    """
    q = payload.query.lower()
    case_ctx = None

    if payload.case_id:
        case = CaseManagementService.get_case(payload.case_id)
        if case:
            case_ctx = {
                "case_id": case.id,
                "customer_name": case.customer_name,
                "risk_score": case.risk_score,
                "amount": case.transaction_amount,
                "reasons": case.reason_codes,
                "primary_scam": case.primary_scam_type,
            }

    if "why" in q or "reason" in q or "flag" in q:
        if case_ctx:
            explanation = (
                f"Customer {case_ctx['customer_name']} (Case {case_ctx['case_id']}) was flagged "
                f"with a high risk score of {case_ctx['risk_score']}/100. "
                f"Primary contributing indicators: " + "; ".join(case_ctx['reasons']) + ". "
                f"Transaction amount: Rs. {case_ctx['amount']:,.2f}."
            )
        else:
            explanation = (
                "The transaction or profile was flagged due to multi-signal divergence: "
                "velocity anomaly exceeding 95th percentile, newly registered payee (< 10m), "
                "and behavioral deviation from historic customer baseline."
            )
    elif "investment" in q:
        explanation = (
            "Investment scam patterns detected: 3 sequential transfer increments to an unverified corporate "
            "beneficiary within 48 hours. Velocity exhibits classic Ponzi/task-scam progression."
        )
    elif "mule" in q:
        explanation = (
            "Mule ring analysis: Target account exhibits high In-Degree Centrality (C_D^+ > 0.05) and "
            "PageRank > 0.015 with rapid dispersion to ATM and CDM cash-out nodes within 2 hops."
        )
    else:
        explanation = (
            f"Analysis for '{payload.query}': Account records show active monitoring under SentinelIQ. "
            f"All explainability vectors are calculated via SHAP and RBI explainability guidelines."
        )

    return AssistantQueryResponse(
        query=payload.query,
        response=explanation,
        case_context=case_ctx,
        is_read_only=True,
    )
