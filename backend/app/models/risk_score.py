"""
SentinelIQ – RiskScore model.
Stores per-transaction and per-customer risk evaluation records.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RiskType(str, enum.Enum):
    FRAUD = "fraud"
    REPAYMENT = "repayment"


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), index=True
    )
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True, index=True
    )
    risk_type: Mapped[RiskType] = mapped_column(Enum(RiskType), index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)

    # Breakdown
    anomaly_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    scam_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    rules_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    primary_scam_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Explainability
    shap_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    reason_codes: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    model_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_shadow: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    customer = relationship("Customer", back_populates="risk_scores")
    transaction = relationship("Transaction", back_populates="risk_scores")
