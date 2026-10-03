# SentinelIQ AI Risk Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2017-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D.svg?logo=redis&logoColor=white)](https://redis.io)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-EB5424.svg)](https://xgboost.readthedocs.io)

**SentinelIQ** is an enterprise-grade dual-risk AI monitoring engine engineered to concurrently execute **real-time Digital Fraud Detection** and **Proactive Loan Repayment Risk Management**. Operating as a unified risk intelligence engine, SentinelIQ evaluates every incoming payment attempt prior to payment session initialization, while continuously tracking long-term borrower credit health and cash flow dynamics.

```
+-----------------------------------------------------------------------------------+
|                            SENTINELIQ AI RISK PLATFORM                            |
+--------------------------------------------------+--------------------------------+
|          ENGINE 1: REAL-TIME FRAUD               |   ENGINE 2: LOAN REPAYMENT     |
|          Pre-Check Transaction Scoring           |   Nightly & Event-Driven Credit|
|          (Sub-200ms Latency SLA)                 |   Risk Scoring Engine          |
+--------------------------------------------------+--------------------------------+
|                        UNIFIED EXPLAINABILITY & CASE MANAGEMENT                   |
|                        SHAP Feature Vectors & Human-in-the-Loop Queue             |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Key Capabilities

1. **Sub-200ms Pre-Checkout Interception**: Intercepts transactions via synchronous `/payments/precheck` before payment gateway session initialization.
2. **Three-Tier Routing**:
   - **Low Risk (< 40)**: Automated approval & seamless checkout.
   - **Medium Risk (40–69)**: Context-aware step-up authorization (OTP / user warning).
   - **High Risk (≥ 70)**: Immediate session block, transaction hold, and real-time analyst alert broadcast.
3. **Six-Class Scam Detection**: Targets Impersonation, Phishing, Fake Refund, Investment Scams, Mule Account Networks, and Payment-Request (Collect) Scams.
4. **Proactive Loan Distress Warning**: Calculates EMI-to-Income, DPD transitions, income shocks, cash burn, and links transaction fraud directly to downstream NPA prevention.
5. **Human-in-the-Loop Case Management & Graph Analytics**: Interactive k ≤ 4 hop mule-ring visualization (react-force-graph) and local SHAP explainability.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies | Role |
|---|---|---|
| **Frontend** | Next.js 16 (Turbopack, TypeScript, Tailwind CSS, Recharts, Lucide) | Consumer Checkout (`/shop`) & Analyst Dashboard (`/analyst`) |
| **Backend API** | FastAPI (Python 3.13), Uvicorn, WebSockets | Synchronous REST Pre-checks, WebSocket threat feeds (`/ws/alerts`) |
| **Relational Store** | PostgreSQL 17 (SQLAlchemy 2.0, Alembic) | ACID Ledgers, entities, risk scores, case queues, loan books |
| **High-Speed Cache** | Redis 7 | 1m, 5m, 1h velocity counters, rate limiting, and ephemeral locks |
| **AI / ML Suite** | XGBoost, Isolation Forest, PyTorch, NetworkX, SHAP, pHash | Multi-class scam inference, behavioral anomaly detection, mule graphs |
| **Workers** | APScheduler / Celery | Nightly credit recalculation, shadow model drift monitoring, retroactive sweeps |

---

## 📁 Repository Structure

```
SentinelIQ/
├── frontend/                     # Next.js 16 App Router UI
│   ├── src/app/                  # Application routes (/shop, /analyst)
│   ├── .env.local                # Frontend environment configuration
│   └── package.json
│
├── backend/                      # FastAPI Microservices Backend
│   ├── app/
│   │   ├── api/                  # REST & WebSocket route handlers
│   │   ├── core/                 # Config, security, JWT authentication
│   │   ├── db/                   # Database session, base model
│   │   ├── models/               # SQLAlchemy ORM entities
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Domain microservices
│   │   │   ├── payment/
│   │   │   ├── risk/
│   │   │   ├── loan/
│   │   │   ├── case_management/
│   │   │   └── merchant/
│   │   ├── ml/                   # ML inference pipelines
│   │   ├── workers/              # Background scheduled jobs
│   │   └── websocket/            # Live analyst alert broadcaster
│   ├── .env                      # Backend environment settings
│   └── requirements.txt
│
├── ml/                           # Model artifacts, training pipelines, experiments
├── data/                         # Synthetic generators, schemas, processed data
├── scripts/                      # Utility and data generation scripts
├── docker-compose.yml            # PostgreSQL 17 & Redis 7 services
└── README.md
```

---

## ⚡ Quick Start

### 1. Infrastructure (PostgreSQL & Redis)
```bash
docker compose up -d
```

### 2. Backend API
```bash
cd backend
python -m venv .venv
# Activate on Windows:
.\.venv\Scripts\Activate.ps1
# Activate on Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Dashboard
```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security & Compliance
- **RBI Explainability Guidelines**: Deterministic SHAP reasons and plain-English codes for every blocked payment or loan flag.
- **DPDP Act Compliance**: Masked PII and encrypted biometric/device fingerprints.
- **Audit Logging**: Immutable event ledger tracking all analyst decisions, risk rule changes, and intervention workflows.
