"""
SentinelIQ – Cases API Routes (FR4).
Endpoints:
  - GET /cases
  - GET /cases/{case_id}
  - POST /cases/action
"""

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.case import (
    CaseActionRequest,
    CaseActionResponse,
    CaseDetail,
    CaseListResponse,
)
from app.services.case_management.service import CaseManagementService

router = APIRouter(prefix="/cases", tags=["Case Management"])


@router.get("", response_model=CaseListResponse)
async def list_cases(
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    Returns prioritized analyst queue ranked continuously by:
    Priority Score = S_risk * Amount_txn * log10(Exposure_total + 1)
    """
    return CaseManagementService.list_cases(status=status_filter, page=page, page_size=page_size)


@router.get("/{case_id}", response_model=CaseDetail)
async def get_case_detail(case_id: str):
    """Fetches comprehensive case investigation details including SHAP feature vectors."""
    case = CaseManagementService.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found",
        )
    return case


@router.post("/action", response_model=CaseActionResponse)
async def perform_case_action(payload: CaseActionRequest):
    """
    Analyst action on case:
      - approve (or clear)
      - block (or flag)
      - restructure (proactive credit restructuring)
    """
    try:
        return CaseManagementService.act_on_case(payload)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
