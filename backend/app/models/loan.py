"""
SentinelIQ – Loan model.
Tracks active loans and repayment risk metrics per customer.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LoanStatus(str, enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    DEFAULTED = "defaulted"
    RESTRUCTURED = "restructured"


class RepaymentRiskTier(str, enum.Enum):
    HEALTHY = "healthy"
    WATCH = "watch"
    STRESSED = "stressed"
    DEFAULT_RISK = "default_risk"


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), index=True
    )
    external_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    principal: Mapped[float] = mapped_column(Float, nullable=False)
    monthly_emi: Mapped[float] = mapped_column(Float, nullable=False)
    interest_rate: Mapped[float] = mapped_column(Float, nullable=False)
    tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    remaining_tenure: Mapped[int] = mapped_column(Integer, nullable=False)
    outstanding_balance: Mapped[float] = mapped_column(Float, nullable=False)

    status: Mapped[LoanStatus] = mapped_column(
        Enum(LoanStatus), default=LoanStatus.ACTIVE, index=True
    )

    # Repayment risk metrics
    repayment_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_tier: Mapped[RepaymentRiskTier] = mapped_column(
        Enum(RepaymentRiskTier), default=RepaymentRiskTier.HEALTHY
    )
    emi_to_income_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    dpd_bucket: Mapped[str] = mapped_column(String(16), default="0")
    late_payment_count_3m: Mapped[int] = mapped_column(Integer, default=0)
    late_payment_count_6m: Mapped[int] = mapped_column(Integer, default=0)
    income_trend_delta: Mapped[float] = mapped_column(Float, default=0.0)
    spending_spike_ratio: Mapped[float] = mapped_column(Float, default=1.0)
    credit_utilization: Mapped[float] = mapped_column(Float, default=0.0)
    new_credit_lines_60d: Mapped[int] = mapped_column(Integer, default=0)
    liquid_balance_post_emi: Mapped[float] = mapped_column(Float, default=0.0)
    net_cash_flow: Mapped[float] = mapped_column(Float, default=0.0)
    runway_months: Mapped[float] = mapped_column(Float, default=12.0)
    fraud_loss_amount: Mapped[float] = mapped_column(Float, default=0.0)

    # Feature store snapshot
    feature_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    disbursed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_emi_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    next_emi_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    risk_last_calculated: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    customer = relationship("Customer", back_populates="loans")
