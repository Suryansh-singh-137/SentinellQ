"""
SentinelIQ – Transaction model.
Core ledger entity for all payment attempts and outcomes.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    STEP_UP = "step_up"
    HELD = "held"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PaymentChannel(str, enum.Enum):
    UPI = "upi"
    CARD = "card"
    WALLET = "wallet"
    NETBANKING = "netbanking"
    CASH = "cash"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    external_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), index=True
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("merchants.id"), index=True
    )
    beneficiary_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("beneficiaries.id"), nullable=True
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    channel: Mapped[PaymentChannel] = mapped_column(
        Enum(PaymentChannel), default=PaymentChannel.UPI
    )
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus), default=TransactionStatus.PENDING, index=True
    )

    # Risk scoring results
    fraud_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_tier: Mapped[str | None] = mapped_column(String(32), nullable=True)
    primary_scam_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    risk_reasons: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Device & geo context
    device_fingerprint: Mapped[str | None] = mapped_column(String(256), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    geolocation: Mapped[str | None] = mapped_column(String(128), nullable=True)

    # Payment session
    session_token: Mapped[str | None] = mapped_column(String(512), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    customer = relationship("Customer", back_populates="transactions")
    merchant = relationship("Merchant", back_populates="transactions")
    risk_scores = relationship("RiskScore", back_populates="transaction", lazy="selectin")
    case = relationship("Case", back_populates="transaction", uselist=False, lazy="selectin")
