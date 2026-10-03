"""
SentinelIQ AI Risk Platform – FastAPI Main Application.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.analytics import router as analytics_router
from app.api.assistant import router as assistant_router
from app.api.cases import router as cases_router
from app.api.loans import router as loans_router
from app.api.payments import router as payments_router
from app.core.config import settings
from app.websocket.manager import alert_broadcaster

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Dual-engine AI Risk Monitoring: Real-time Digital Fraud Detection & Proactive Loan Repayment Risk Management",
)

# ── CORS Middleware ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routes ──────────────────────────────────────────────
app.include_router(payments_router)
app.include_router(cases_router)
app.include_router(loans_router)
app.include_router(analytics_router)
app.include_router(assistant_router)


# ── WebSocket Endpoint (FR1 & FR4) ──────────────────────────
@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """Real-time analyst alert broadcast stream."""
    await alert_broadcaster.connect(websocket)
    try:
        while True:
            # Keep connection open and receive optional analyst ping/acknowledgements
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        alert_broadcaster.disconnect(websocket)
    except Exception:
        alert_broadcaster.disconnect(websocket)


# ── Health Check ────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "service": "SentinelIQ AI Risk Platform",
        "version": "1.0.0",
        "subsystems": {
            "fraud_precheck": "active",
            "scam_classifier": "active",
            "loan_repayment_engine": "active",
            "mule_graph_analytics": "active",
            "websocket_broadcaster": "active",
        },
    }
