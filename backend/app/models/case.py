"""
SentinelIQ – Case model.
Analyst investigation queue for high-risk transactions and credit stress events.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CaseStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    BLOCKED = "blocked"
    RESTRUCTURED = "restructured"
    CLOSED = "closed"


class CaseType(str, enum.Enum):
    FRAUD = "fraud"
    CREDIT_STRESS = "credit_stress"
    MULE_NETWORK = "mule_network"


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), index=True
    )
    analyst_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysts.id"), nullable=True
    )
    case_type: Mapped[CaseType] = mapped_column(Enum(CaseType), index=True)
    status: Mapped[CaseStatus] = mapped_column(
        Enum(CaseStatus), default=CaseStatus.OPEN, index=True
    )
    priority_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)

    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    transaction_amount: Mapped[float] = mapped_column(Float, default=0.0)
    total_exposure: Mapped[float] = mapped_column(Float, default=0.0)

    # Explainability
    reason_codes: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    shap_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    analyst_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    transaction = relationship("Transaction", back_populates="case")
    customer = relationship("Customer")
    analyst = relationship("Analyst", back_populates="cases")
