"""
SentinelIQ – Customer model.
Represents an end-user/account holder in the financial system.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    external_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(256))
    email: Mapped[str | None] = mapped_column(String(256), nullable=True)
    phone_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    verified_monthly_income: Mapped[float] = mapped_column(Float, default=0.0)
    account_created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    kyc_level: Mapped[str] = mapped_column(String(32), default="basic")
    risk_tier: Mapped[str] = mapped_column(String(32), default="standard")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    transactions = relationship("Transaction", back_populates="customer", lazy="selectin")
    devices = relationship("Device", back_populates="customer", lazy="selectin")
    beneficiaries = relationship("Beneficiary", back_populates="customer", lazy="selectin")
    loans = relationship("Loan", back_populates="customer", lazy="selectin")
    risk_scores = relationship("RiskScore", back_populates="customer", lazy="selectin")
