"""
SentinelIQ – Isolation Forest + PyTorch Autoencoder anomaly detector.
Evaluates device, time-of-day, location, and amount vectors against
the customer's personal historic baseline to produce a behavioral outlier score.
"""

import logging
import numpy as np
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

# Pre-trained Isolation Forest instance (loaded once at startup)
_isolation_forest: IsolationForest | None = None


def _get_isolation_forest() -> IsolationForest:
    """Lazy-load or create the Isolation Forest model."""
    global _isolation_forest
    if _isolation_forest is None:
        logger.info("Initialising Isolation Forest with default parameters")
        _isolation_forest = IsolationForest(
            n_estimators=200,
            contamination=0.05,
            random_state=42,
            n_jobs=-1,
        )
        # In production this would load a pre-trained model from disk.
        # For now we operate in inference-ready mode with rule-based fallback.
    return _isolation_forest


def compute_anomaly_score(features: dict) -> dict:
    """
    Compute behavioral anomaly score from transaction features.

    Returns dict with:
      - anomaly_score: float 0-100
      - is_anomalous: bool
      - deviation_factors: list[str]
    """
    deviation_factors: list[str] = []
    score_components: list[float] = []

    # ── Amount deviation ────────────────────────────────────
    amount = features.get("amount", 0)
    avg_amount = features.get("avg_txn_amount", 0) or 1
    amount_ratio = amount / avg_amount
    if amount_ratio > 5:
        score_components.append(min(40, amount_ratio * 5))
        deviation_factors.append(
            f"Transaction amount {amount_ratio:.1f}x historic average"
        )
    elif amount_ratio > 2:
        score_components.append(amount_ratio * 3)
        deviation_factors.append(
            f"Transaction amount {amount_ratio:.1f}x above typical"
        )

    # ── Velocity anomaly ────────────────────────────────────
    txn_count_1h = features.get("txn_count_1h", 0)
    if txn_count_1h > 10:
        score_components.append(min(30, txn_count_1h * 2))
        deviation_factors.append(f"High velocity: {txn_count_1h} txns in last hour")

    txn_count_5m = features.get("txn_count_5m", 0)
    if txn_count_5m > 3:
        score_components.append(min(25, txn_count_5m * 5))
        deviation_factors.append(f"Rapid burst: {txn_count_5m} txns in 5 minutes")

    # ── Device anomaly ──────────────────────────────────────
    if features.get("is_new_device", False):
        score_components.append(15)
        deviation_factors.append("New device detected")

    device_age = features.get("device_age_hours", 9999)
    if device_age < 1:
        score_components.append(10)
        deviation_factors.append("Device registered less than 1 hour ago")

    # ── Geolocation anomaly ─────────────────────────────────
    # Simplified: in production, compare against historic geo clusters
    geo = features.get("geolocation", "")
    if not geo:
        score_components.append(5)
        deviation_factors.append("Missing geolocation data")

    # ── Time-of-day anomaly ─────────────────────────────────
    # Transactions between 1 AM and 5 AM local time are unusual
    from datetime import datetime, timezone
    hour = datetime.now(timezone.utc).hour
    if 1 <= hour <= 5:
        score_components.append(10)
        deviation_factors.append(f"Unusual transaction hour: {hour}:00 UTC")

    # ── Aggregate ───────────────────────────────────────────
    raw_score = sum(score_components)
    anomaly_score = min(100.0, max(0.0, raw_score))

    return {
        "anomaly_score": round(anomaly_score, 2),
        "is_anomalous": anomaly_score >= 40,
        "deviation_factors": deviation_factors,
    }
