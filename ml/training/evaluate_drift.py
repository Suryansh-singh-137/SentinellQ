"""
SentinelIQ - Model Governance & Quantitative Drift Monitoring
Calculates Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) test
to detect feature/prediction drift between baseline and production distributions.
Formula: PSI = sum((P_i - Q_i) * ln(P_i / Q_i))
"""

import numpy as np
import pandas as pd
from scipy.stats import ks_2samp


def calculate_psi(
    expected: np.ndarray,
    actual: np.ndarray,
    num_buckets: int = 10,
    epsilon: float = 1e-4
) -> float:
    """Calculates the Population Stability Index (PSI) across num_buckets bins."""
    # Compute quantiles based on expected distribution
    percentiles = np.linspace(0, 100, num_buckets + 1)
    breakpoints = np.percentile(expected, percentiles)
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf

    # Bucket counts
    expected_counts = np.histogram(expected, bins=breakpoints)[0]
    actual_counts = np.histogram(actual, bins=breakpoints)[0]

    # Convert to fractions
    expected_pct = expected_counts / len(expected)
    actual_pct = actual_counts / len(actual)

    # Avoid zero division
    expected_pct = np.where(expected_pct == 0, epsilon, expected_pct)
    actual_pct = np.where(actual_pct == 0, epsilon, actual_pct)

    # Calculate PSI
    psi_vector = (actual_pct - expected_pct) * np.log(actual_pct / expected_pct)
    psi_val = float(np.sum(psi_vector))
    return psi_val


def evaluate_distribution_drift(
    baseline_scores: np.ndarray,
    current_scores: np.ndarray,
    psi_threshold: float = 0.25
) -> dict:
    """Evaluates both PSI and Kolmogorov-Smirnov test for production drift monitoring."""
    psi = calculate_psi(baseline_scores, current_scores)
    ks_stat, ks_pvalue = ks_2samp(baseline_scores, current_scores)

    status = "STABLE"
    if psi >= psi_threshold or ks_pvalue < 0.05:
        status = "DRIFT_ALERT"
    elif psi >= 0.10:
        status = "MODERATE_DRIFT"

    return {
        "status": status,
        "psi_value": round(psi, 4),
        "psi_threshold": psi_threshold,
        "ks_statistic": round(float(ks_stat), 4),
        "ks_pvalue": float(ks_pvalue),
        "action_required": status != "STABLE"
    }


if __name__ == "__main__":
    np.random.seed(42)
    baseline = np.random.beta(a=2, b=5, size=1000)
    # Simulate drifted distribution
    drifted = np.random.beta(a=3, b=4, size=1000)

    report = evaluate_distribution_drift(baseline, drifted)
    print("--- Distribution Drift Report ---")
    for k, v in report.items():
        print(f"{k}: {v}")
