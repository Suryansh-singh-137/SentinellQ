"""
SentinelIQ – Merchant model.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    external_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(256))
    category: Mapped[str] = mapped_column(String(128), default="general")
    domain: Mapped[str | None] = mapped_column(String(512), nullable=True)
    domain_age_days: Mapped[int] = mapped_column(Integer, default=365)
    reputation_score: Mapped[float] = mapped_column(Float, default=50.0)
    is_verified: Mapped[bool] = mapped_column(default=True)
    is_blacklisted: Mapped[bool] = mapped_column(default=False)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    total_flagged: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    transactions = relationship("Transaction", back_populates="merchant", lazy="selectin")
