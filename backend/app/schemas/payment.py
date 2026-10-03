"""
SentinelIQ – Payment schemas.
Request/response models for /payments/* endpoints.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PrecheckRequest(BaseModel):
    """POST /payments/precheck request body."""
    customer_id: str = Field(..., description="External customer identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    merchant_id: str = Field(..., description="Target merchant identifier")
    channel: str = Field(..., description="Payment channel: upi, card, wallet, netbanking, cash")
    device_fingerprint: str = Field(..., description="Device fingerprint hash")
    ip_address: str = Field(..., description="Client IP address")
    geolocation: str = Field(default="", description="Lat,Lng or city string")
    beneficiary_id: str = Field(default="", description="Beneficiary/payee identifier")


class RiskBreakdown(BaseModel):
    anomaly_score: float = 0.0
    scam_score: float = 0.0
    rules_score: float = 0.0
    primary_scam_type: str | None = None
    reason_codes: list[str] = []


class PrecheckResponse(BaseModel):
    """POST /payments/precheck response."""
    transaction_id: str
    decision: str  # "approve", "step_up", "block"
    fraud_score: float
    risk_tier: str  # "low", "medium", "high"
    risk_breakdown: RiskBreakdown
    session_token: str | None = None  # Only for low-risk approvals
    step_up_type: str | None = None   # "otp" or "warning" for medium risk
    step_up_message: str | None = None
    block_message: str | None = None  # For high-risk blocks
    created_at: datetime


class StepUpConfirmRequest(BaseModel):
    """POST /payments/step-up/confirm – user confirms step-up challenge."""
    transaction_id: str
    otp_code: str | None = None
    confirmed: bool = True


class StepUpConfirmResponse(BaseModel):
    transaction_id: str
    decision: str  # "approved" or "cancelled"
    session_token: str | None = None


class PaymentSessionRequest(BaseModel):
    """POST /payments/session – create a payment gateway session."""
    transaction_id: str


class PaymentSessionResponse(BaseModel):
    transaction_id: str
    session_token: str
    gateway: str = "juspay"
    status: str = "created"
