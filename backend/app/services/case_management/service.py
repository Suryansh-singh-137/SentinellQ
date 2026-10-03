"""
SentinelIQ – Case Management Service (FR4).
Calculates priority rank:
  Priority Score = S_risk * Amount_txn * log10(Exposure_total + 1)
Maintains ranked analyst queue and case decisions (Approve, Block, Restructure).
"""

import math
import uuid
from datetime import datetime, timezone
from typing import Any

from app.schemas.case import (
    CaseActionRequest,
    CaseActionResponse,
    CaseDetail,
    CaseListItem,
    CaseListResponse,
)


def calculate_priority_score(
    risk_score: float, amount: float, total_exposure: float
) -> float:
    """FR4 Priority formula: Priority Score = S_risk * Amount_txn * log10(Exposure_total + 1)"""
    log_exposure = math.log10(max(0.0, total_exposure) + 1.0)
    score = (risk_score / 100.0) * amount * max(1.0, log_exposure)
    return round(score, 2)


# In-memory store for high-throughput fast operations and standalone execution
_CASES_DB: dict[str, dict[str, Any]] = {}


class CaseManagementService:
    @staticmethod
    def create_case(
        customer_id: str,
        case_type: str,
        risk_score: float,
        transaction_amount: float,
        total_exposure: float,
        reason_codes: list[str],
        shap_values: dict | None = None,
        transaction_id: str | None = None,
        customer_name: str = "Rahul Sharma",
        primary_scam_type: str | None = None,
    ) -> dict[str, Any]:
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        priority = calculate_priority_score(
            risk_score=risk_score,
            amount=transaction_amount,
            total_exposure=total_exposure,
        )

        case_record = {
            "id": case_id,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "transaction_id": transaction_id,
            "case_type": case_type,
            "status": "open",
            "priority_score": priority,
            "risk_score": risk_score,
            "transaction_amount": transaction_amount,
            "total_exposure": total_exposure,
            "primary_scam_type": primary_scam_type,
            "reason_codes": reason_codes,
            "shap_values": shap_values or {},
            "analyst_id": None,
            "analyst_name": None,
            "analyst_notes": None,
            "created_at": datetime.now(timezone.utc),
            "resolved_at": None,
        }
        _CASES_DB[case_id] = case_record
        return case_record

    @staticmethod
    def list_cases(
        status: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> CaseListResponse:
        cases = list(_CASES_DB.values())
        if status:
            cases = [c for c in cases if c["status"] == status]

        # Order continuously by priority score descending
        cases.sort(key=lambda x: x["priority_score"], reverse=True)

        total = len(cases)
        start = (page - 1) * page_size
        end = start + page_size
        page_cases = cases[start:end]

        items = [
            CaseListItem(
                id=c["id"],
                case_type=c["case_type"],
                status=c["status"],
                priority_score=c["priority_score"],
                risk_score=c["risk_score"],
                transaction_amount=c["transaction_amount"],
                customer_name=c["customer_name"],
                primary_scam_type=c["primary_scam_type"],
                reason_codes=c["reason_codes"],
                created_at=c["created_at"],
            )
            for c in page_cases
        ]
        return CaseListResponse(
            cases=items,
            total=total,
            page=page,
            page_size=page_size,
        )

    @staticmethod
    def get_case(case_id: str) -> CaseDetail | None:
        c = _CASES_DB.get(case_id)
        if not c:
            return None
        return CaseDetail(
            id=c["id"],
            case_type=c["case_type"],
            status=c["status"],
            priority_score=c["priority_score"],
            risk_score=c["risk_score"],
            transaction_amount=c["transaction_amount"],
            customer_name=c["customer_name"],
            primary_scam_type=c["primary_scam_type"],
            reason_codes=c["reason_codes"],
            created_at=c["created_at"],
            customer_id=c["customer_id"],
            transaction_id=c["transaction_id"],
            analyst_id=c["analyst_id"],
            analyst_name=c["analyst_name"],
            total_exposure=c["total_exposure"],
            shap_values=c["shap_values"],
            analyst_notes=c["analyst_notes"],
            resolved_at=c["resolved_at"],
        )

    @staticmethod
    def act_on_case(payload: CaseActionRequest) -> CaseActionResponse:
        c = _CASES_DB.get(payload.case_id)
        if not c:
            raise ValueError(f"Case {payload.case_id} not found")

        action_map = {
            "approve": "approved",
            "clear": "approved",
            "block": "blocked",
            "flag": "blocked",
            "restructure": "restructured",
        }
        new_status = action_map.get(payload.action.lower(), "closed")
        c["status"] = new_status
        c["analyst_notes"] = payload.notes
        c["resolved_at"] = datetime.now(timezone.utc)

        return CaseActionResponse(
            case_id=payload.case_id,
            new_status=new_status,
            message=f"Case action '{payload.action}' executed successfully. Status is now {new_status}.",
        )


# Seed initial demo cases for testing
if not _CASES_DB:
    CaseManagementService.create_case(
        customer_id="CUST-4912",
        case_type="fraud",
        risk_score=88.5,
        transaction_amount=45000.0,
        total_exposure=120000.0,
        reason_codes=[
            "HR-IMP-01: Active voice call with newly added beneficiary (<= 10 mins)",
            "Transaction amount 9.0x historic average",
            "Target payee added 4 minutes ago",
        ],
        primary_scam_type="impersonation",
        customer_name="Aarav Mehta",
    )
    CaseManagementService.create_case(
        customer_id="CUST-8821",
        case_type="credit_stress",
        risk_score=78.0,
        transaction_amount=18500.0,
        total_exposure=350000.0,
        reason_codes=[
            "EMI-to-Income ratio exceeds 40%",
            "Income reduction delta > 20% over trailing 3 months",
            "Late payment velocity: 2 missed payments in 90 days",
        ],
        primary_scam_type=None,
        customer_name="Priya Patel",
    )
