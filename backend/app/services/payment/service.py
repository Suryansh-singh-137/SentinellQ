"""
SentinelIQ – Payment Service (FR1).
Implements pre-checkout synchronous workflow:
  - /payments/precheck
  - /payments/session
  - /payments/step-up/confirm
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from app.schemas.payment import (
    PaymentSessionResponse,
    PrecheckRequest,
    PrecheckResponse,
    RiskBreakdown,
    StepUpConfirmRequest,
    StepUpConfirmResponse,
)
from app.services.case_management.service import CaseManagementService
from app.services.risk.aggregator import aggregate_risk
from app.websocket.manager import alert_broadcaster

# Fast in-memory ledger store
_TRANSACTIONS: dict[str, dict[str, Any]] = {}
_USER_HISTORIES: dict[str, dict[str, Any]] = {
    "CUST-001": {
        "avg_amount": 2500.0,
        "txn_count_1h": 1,
        "txn_count_5m": 0,
        "known_devices": ["dev-fp-safari-mac-01"],
    },
    "CUST-002": {
        "avg_amount": 1200.0,
        "txn_count_1h": 8,
        "txn_count_5m": 3,
        "known_devices": [],
    },
}


class PaymentService:
    @staticmethod
    async def precheck(req: PrecheckRequest) -> PrecheckResponse:
        txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        now = datetime.now(timezone.utc)

        # 1. Retrieve customer historical baselines
        cust_profile = _USER_HISTORIES.get(
            req.customer_id,
            {"avg_amount": 3000.0, "txn_count_1h": 0, "txn_count_5m": 0, "known_devices": []},
        )
        is_new_device = req.device_fingerprint not in cust_profile.get("known_devices", [])

        # 2. Build feature vector
        features = {
            "amount": req.amount,
            "avg_txn_amount": cust_profile.get("avg_amount", 3000.0),
            "txn_count_1h": cust_profile.get("txn_count_1h", 0),
            "txn_count_5m": cust_profile.get("txn_count_5m", 0),
            "is_new_device": is_new_device,
            "device_age_hours": 0.2 if is_new_device else 720.0,
            "beneficiary_age_minutes": 5.0 if "new" in req.beneficiary_id.lower() else 1440.0,
            "beneficiary_total_txns": 0 if "new" in req.beneficiary_id.lower() else 5,
            "is_during_call": "call" in req.device_fingerprint.lower(),
            "is_collect_request": req.channel.lower() == "upi" and "collect" in req.merchant_id.lower(),
            "merchant_is_blacklisted": "blacklisted" in req.merchant_id.lower(),
            "is_mule_flagged": "mule" in req.beneficiary_id.lower(),
            "merchant_reputation": 15.0 if "shady" in req.merchant_id.lower() else 85.0,
            "merchant_domain_age_days": 12 if "new" in req.merchant_id.lower() else 400,
            "geolocation": req.geolocation,
        }

        # 3. Aggregate Risk Score
        risk_result = aggregate_risk(features)

        # 4. Process Three-Tier Decision
        session_token = None
        step_up_type = None
        step_up_message = None
        block_message = None

        if risk_result.decision == "approve":
            session_token = f"JUSPAY_SESS_{uuid.uuid4().hex[:16]}"
            txn_status = "approved"

        elif risk_result.decision == "step_up":
            txn_status = "step_up"
            if "DEBIT your account" in str(risk_result.reason_codes):
                step_up_type = "warning"
                step_up_message = "Warning: This UPI request will DEBIT your account. Merchant flagged by other users."
            else:
                step_up_type = "otp"
                step_up_message = "Step-up verification required: Please enter the 6-digit OTP sent to your phone."

        else:  # block
            txn_status = "held"
            block_message = "Transaction held for your safety. Our fraud prevention team is reviewing this payment."

            # Automatically create case in analyst queue
            case_record = CaseManagementService.create_case(
                customer_id=req.customer_id,
                case_type="fraud",
                risk_score=risk_result.final_score,
                transaction_amount=req.amount,
                total_exposure=req.amount * 2.5,
                reason_codes=risk_result.reason_codes,
                shap_values=risk_result.shap_values,
                transaction_id=txn_id,
                primary_scam_type=risk_result.scam.scam_type,
            )

            # Broadcast live alert via WebSocket
            await alert_broadcaster.broadcast_alert(
                {
                    "event": "HIGH_RISK_TRANSACTION_BLOCKED",
                    "transaction_id": txn_id,
                    "customer_id": req.customer_id,
                    "amount": req.amount,
                    "fraud_score": risk_result.final_score,
                    "primary_scam": risk_result.scam.scam_type,
                    "case_id": case_record["id"],
                    "reasons": risk_result.reason_codes,
                    "timestamp": now.isoformat(),
                }
            )

        # Store transaction record
        _TRANSACTIONS[txn_id] = {
            "id": txn_id,
            "customer_id": req.customer_id,
            "amount": req.amount,
            "merchant_id": req.merchant_id,
            "channel": req.channel,
            "status": txn_status,
            "fraud_score": risk_result.final_score,
            "risk_tier": risk_result.risk_tier,
            "session_token": session_token,
            "created_at": now,
        }

        return PrecheckResponse(
            transaction_id=txn_id,
            decision=risk_result.decision,
            fraud_score=risk_result.final_score,
            risk_tier=risk_result.risk_tier,
            risk_breakdown=RiskBreakdown(
                anomaly_score=risk_result.anomaly.anomaly_score,
                scam_score=round(risk_result.scam.confidence * 100, 2),
                rules_score=risk_result.rules.rules_score,
                primary_scam_type=risk_result.scam.scam_type if risk_result.scam.scam_type != "none" else None,
                reason_codes=risk_result.reason_codes,
            ),
            session_token=session_token,
            step_up_type=step_up_type,
            step_up_message=step_up_message,
            block_message=block_message,
            created_at=now,
        )

    @staticmethod
    def confirm_step_up(req: StepUpConfirmRequest) -> StepUpConfirmResponse:
        txn = _TRANSACTIONS.get(req.transaction_id)
        if not txn:
            raise ValueError(f"Transaction {req.transaction_id} not found")

        if req.confirmed:
            session_token = f"JUSPAY_SESS_STEPUP_{uuid.uuid4().hex[:14]}"
            txn["status"] = "approved"
            txn["session_token"] = session_token
            return StepUpConfirmResponse(
                transaction_id=req.transaction_id,
                decision="approved",
                session_token=session_token,
            )
        else:
            txn["status"] = "cancelled"
            return StepUpConfirmResponse(
                transaction_id=req.transaction_id,
                decision="cancelled",
                session_token=None,
            )

    @staticmethod
    def create_session(transaction_id: str) -> PaymentSessionResponse:
        txn = _TRANSACTIONS.get(transaction_id)
        if not txn:
            raise ValueError(f"Transaction {transaction_id} not found")
        if txn["status"] not in ("approved", "completed"):
            raise ValueError(f"Transaction {transaction_id} is not in approved state (status: {txn['status']})")

        token = txn.get("session_token") or f"JUSPAY_SESS_{uuid.uuid4().hex[:16]}"
        txn["session_token"] = token
        return PaymentSessionResponse(
            transaction_id=transaction_id,
            session_token=token,
            gateway="juspay",
            status="created",
        )
