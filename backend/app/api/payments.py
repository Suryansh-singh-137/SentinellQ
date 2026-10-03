"""
SentinelIQ – Payments API Routes (FR1).
Endpoints:
  - POST /payments/precheck
  - POST /payments/session
  - POST /payments/step-up/confirm
"""

from fastapi import APIRouter, HTTPException, status

from app.schemas.payment import (
    PaymentSessionRequest,
    PaymentSessionResponse,
    PrecheckRequest,
    PrecheckResponse,
    StepUpConfirmRequest,
    StepUpConfirmResponse,
)
from app.services.payment.service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/precheck", response_model=PrecheckResponse, status_code=status.HTTP_200_OK)
async def precheck_payment(payload: PrecheckRequest):
    """
    FR1 Mandatory Synchronous Pre-checkout Scoring.
    Evaluates risk before Juspay payment gateway initialization.
    Returns: approve, step_up, or block.
    """
    try:
        return await PaymentService.precheck(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Precheck evaluation error: {str(e)}",
        )


@router.post("/step-up/confirm", response_model=StepUpConfirmResponse)
async def confirm_step_up(payload: StepUpConfirmRequest):
    """
    Handles user confirmation or cancellation of step-up challenge (OTP or context warning).
    """
    try:
        return PaymentService.confirm_step_up(payload)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/session", response_model=PaymentSessionResponse)
async def create_payment_session(payload: PaymentSessionRequest):
    """
    Generates Juspay session token for approved transactions.
    Strictly blocked if risk score >= 70.
    """
    try:
        return PaymentService.create_session(payload.transaction_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
