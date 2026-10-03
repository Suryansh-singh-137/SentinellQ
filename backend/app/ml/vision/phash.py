"""
SentinelIQ – Perceptual Hashing (pHash) Group Scam Detection (FR2).
Clusters receipts and merchant assets with Hamming distance d_H <= 10
to unmask syndicated fraud campaigns across disparate customer accounts.
"""

import imagehash
from PIL import Image
import io
from typing import Any


def calculate_image_hash(image_bytes: bytes) -> str:
    """Computes 64-bit perceptual hash (pHash) from image bytes."""
    image = Image.open(io.BytesIO(image_bytes))
    hash_obj = imagehash.phash(image)
    return str(hash_obj)


def compare_hamming_distance(hash1: str, hash2: str) -> int:
    """Calculates Hamming distance between two hex pHash strings."""
    h1 = imagehash.hex_to_hash(hash1)
    h2 = imagehash.hex_to_hash(hash2)
    return h1 - h2


def detect_group_scam_campaign(target_hash: str, known_fraud_hashes: list[dict[str, str]]) -> dict[str, Any]:
    """
    Compares target receipt pHash with existing syndicated scam database.
    Flag if Hamming distance d_H <= 10.
    """
    matches = []
    target = imagehash.hex_to_hash(target_hash)

    for item in known_fraud_hashes:
        known_h = imagehash.hex_to_hash(item["phash"])
        dist = int(target - known_h)
        if dist <= 10:
            matches.append({
                "campaign_id": item.get("campaign_id", "CAMP-UNKNOWN"),
                "scam_type": item.get("scam_type", "syndicated_receipt_forgery"),
                "hamming_distance": int(dist),
                "confidence": round((1.0 - (dist / 10.0)) * 100, 1),
            })

    is_syndicated = len(matches) > 0
    return {
        "is_syndicated_campaign": is_syndicated,
        "target_phash": target_hash,
        "matched_campaigns": matches,
        "min_hamming_distance": int(min([m["hamming_distance"] for m in matches])) if matches else None,
        "risk_recommendation": "BLOCK_AND_FLAG_SYNDICATE" if is_syndicated else "NORMAL",
    }
