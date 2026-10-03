"""
SentinelIQ – Model Governance & Drift Monitoring (FR5).
Calculates Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) test.
"""

import numpy as np
from scipy.stats import ks_2samp


def calculate_psi(
    expected: np.ndarray,
    actual: np.ndarray,
    num_buckets: int = 10,
    epsilon: float = 1e-4,
) -> float:
    percentiles = np.linspace(0, 100, num_buckets + 1)
    breakpoints = np.percentile(expected, percentiles)
    breakpoints[0] = -np.inf
    breakpoints[-1] = np.inf

    expected_counts = np.histogram(expected, bins=breakpoints)[0]
    actual_counts = np.histogram(actual, bins=breakpoints)[0]

    expected_pct = expected_counts / len(expected)
    actual_pct = actual_counts / len(actual)

    expected_pct = np.where(expected_pct == 0, epsilon, expected_pct)
    actual_pct = np.where(actual_pct == 0, epsilon, actual_pct)

    psi_vector = (actual_pct - expected_pct) * np.log(actual_pct / expected_pct)
    return float(np.sum(psi_vector))


def evaluate_distribution_drift(
    baseline_scores: np.ndarray,
    current_scores: np.ndarray,
    psi_threshold: float = 0.25,
) -> dict:
    psi = calculate_psi(baseline_scores, current_scores)
    ks_stat, ks_pvalue = ks_2samp(baseline_scores, current_scores)

    status = "STABLE"
    if psi >= psi_threshold or ks_pvalue < 0.05:
        status = "DRIFT_ALERT"
    elif psi >= 0.10:
        status = "MODERATE_DRIFT"

    return {
        "status": status,
        "psi_value": round(float(psi), 4),
        "psi_threshold": psi_threshold,
        "ks_statistic": round(float(ks_stat), 4),
        "ks_pvalue": float(ks_pvalue),
        "action_required": status != "STABLE",
    }
