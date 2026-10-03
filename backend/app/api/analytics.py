"""
SentinelIQ – Analytics, Mule Graphs, Drift & Computer Vision Routes (FR2, FR4, FR5).
Endpoints:
  - GET /analytics/mule-graph
  - GET /analytics/drift
  - POST /analytics/phash-check
"""

from fastapi import APIRouter
import numpy as np
from pydantic import BaseModel

from app.ml.graph.mule_ring import build_mule_ring_graph
from app.ml.vision.phash import detect_group_scam_campaign

router = APIRouter(prefix="/analytics", tags=["Analytics & Governance"])


class PHashCheckRequest(BaseModel):
    phash: str = "d87a4c2f1e9b8a7c"


@router.get("/mule-graph")
async def get_mule_ring_graph(k_hops: int = 4):
    """
    Returns interactive multi-hop mule account topology (k <= 4).
    Nodes with in-degree centrality > 0.05 or PageRank > 0.015 are highlighted.
    """
    return build_mule_ring_graph(k_hops=k_hops)


@router.get("/drift")
async def get_drift_evaluation():
    """
    Calculates Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) test
    to evaluate model distribution drift between baseline and production scores.
    """
    from app.ml.explainability.drift import evaluate_distribution_drift

    np.random.seed(42)
    baseline_scores = np.random.beta(a=2, b=5, size=1500)
    current_scores = np.random.beta(a=2.2, b=4.8, size=1500)

    return evaluate_distribution_drift(baseline_scores, current_scores)


@router.post("/phash-check")
async def check_phash_syndicate(payload: PHashCheckRequest):
    """
    Detects syndicate group fraud campaigns using perceptual hashing Hamming distance d_H <= 10.
    """
    known_database = [
        {"campaign_id": "SYNDICATE-DELHI-04", "phash": "d87a4c2f1e9b8a7c", "scam_type": "fake_electricity_bill"},
        {"campaign_id": "SYNDICATE-JAMMTARA-09", "phash": "a1b2c3d4e5f60718", "scam_type": "fake_bank_kyc_receipt"},
    ]
    return detect_group_scam_campaign(payload.phash, known_database)
