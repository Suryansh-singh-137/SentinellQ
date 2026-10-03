"""
SentinelIQ – Case management schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CaseListItem(BaseModel):
    id: str
    case_type: str
    status: str
    priority_score: float
    risk_score: float
    transaction_amount: float
    customer_name: str | None = None
    primary_scam_type: str | None = None
    reason_codes: list[str] = []
    created_at: datetime


class CaseDetail(CaseListItem):
    customer_id: str
    transaction_id: str | None = None
    analyst_id: str | None = None
    analyst_name: str | None = None
    total_exposure: float = 0.0
    shap_values: dict | None = None
    analyst_notes: str | None = None
    resolved_at: datetime | None = None


class CaseActionRequest(BaseModel):
    case_id: str
    action: str = Field(..., description="approve, block, or restructure")
    notes: str | None = None


class CaseActionResponse(BaseModel):
    case_id: str
    new_status: str
    message: str


class CaseListResponse(BaseModel):
    cases: list[CaseListItem]
    total: int
    page: int
    page_size: int
