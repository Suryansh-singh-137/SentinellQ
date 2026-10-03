# SentinelIQ AI Risk Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2017-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D.svg?logo=redis&logoColor=white)](https://redis.io)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-EB5424.svg)](https://xgboost.readthedocs.io)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org)
[![Tests](https://img.shields.io/badge/Tests-14%20Passed-10b981.svg)]()

**SentinelIQ** is an enterprise-grade dual-risk AI monitoring engine engineered to concurrently execute **real-time Digital Fraud Detection** and **Proactive Loan Repayment Risk Management**. Operating as a unified risk intelligence engine, SentinelIQ intercepts transactions prior to payment session initialization within a sub-200ms SLA, while continuously forecasting borrower debt stress, liquid runway, and Non-Performing Asset (NPA) likelihood.

```
+-----------------------------------------------------------------------------------+
|                            SENTINELIQ AI RISK PLATFORM                            |
+--------------------------------------------------+--------------------------------+
|          ENGINE 1: REAL-TIME FRAUD               |   ENGINE 2: LOAN REPAYMENT     |
|          Pre-Check Transaction Scoring           |   Nightly & Event-Driven Credit|
|          (Sub-200ms Latency SLA)                 |   Risk Scoring Engine          |
+--------------------------------------------------+--------------------------------+
|                        UNIFIED EXPLAINABILITY & CASE MANAGEMENT                   |
|       Local SHAP Feature Vectors · Interactive Mule Topology · Live Threat Feeds  |
+-----------------------------------------------------------------------------------+
```

---

## 📑 Table of Contents

- [Executive Architecture](#-executive-architecture)
- [Core Functional Capabilities](#-core-functional-capabilities)
  - [FR1: Real-Time Payment Scoring & Three-Tier Routing](#fr1-real-time-payment-scoring--three-tier-routing)
  - [FR2: Hybrid Scam & Behavioral Anomaly Detection](#fr2-hybrid-scam--behavioral-anomaly-detection)
  - [FR3: Loan Repayment Risk & Early Warning Engine](#fr3-loan-repayment-risk--early-warning-engine)
  - [FR4: Analyst Case Management, Mule Graphs & Explainability](#fr4-analyst-case-management-mule-graphs--explainability)
  - [FR5: Self-Learning Feedback Loop & Quantitative Governance](#fr5-self-learning-feedback-loop--quantitative-governance)
- [API Reference](#-api-reference)
- [Repository Structure](#-repository-structure)
- [Local Setup & Quick Start](#-local-setup--quick-start)
- [Running Automated Verification Tests](#-running-automated-verification-tests)
- [Security, RBI & DPDP Compliance](#-security-rbi--dpdp-compliance)

---

## 🏛️ Executive Architecture

SentinelIQ unites synchronous inline payment interception with asynchronous continuous credit risk intelligence:

```
                          [ Incoming Transaction Payload ]
                                        │
                                        ▼
                         POST /payments/precheck (< 200ms SLA)
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
  Unsupervised Anomaly          Supervised Scam              Deterministic Rules
(Isolation Forest / PyTorch)  (XGBoost 6-Class Model)         (Hard Overrides)
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        ▼
                           Unified Risk Aggregator (0-100)
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
      [ Low Risk < 40 ]       [ Medium Risk 40-69 ]       [ High Risk ≥ 70 ]
      Automated Approval      Step-Up Challenge           Block & Hold Txn
      Juspay Session Token    (OTP / Safety Warning)      Queue Ingest & /ws/alerts
                                                                   │
                                                                   ▼
                                                       Priority-Ranked Queue
                                                       Priority = S_risk * Amt * log10(Exposure+1)
                                                                   │
                                                                   ▼
                                                       Analyst Investigation Suite
                                                       SHAP Reasons · Mule Graph · LLM Assistant
```

---

## 🚀 Core Functional Capabilities

### FR1: Real-Time Payment Scoring & Three-Tier Routing

When a user initiates checkout, the client issues a synchronous `POST /payments/precheck` call containing customer ID, transaction amount, target merchant, payment channel (UPI, Card, Wallet, NetBanking, Cash), device fingerprint, IP address, and beneficiary ID.

| Decision Tier | Risk Score Threshold | Systemic Action Protocol | User & Operational Outcome |
|---|---|---|---|
| **Low Risk** | $\text{Score} < 40$ | Creates Juspay session via `/payments/session` and returns session token. | Automated approval. Checkout completes seamlessly without user friction. |
| **Medium Risk** | $40 \le \text{Score} < 70$ | Halts automated session creation. Issues step-up authorization payload. | Displays context-aware step-up screen (OTP verification or warning popup: *"Merchant flagged by other users"*). Confirmation proceeds; cancel aborts. |
| **High Risk** | $\text{Score} \ge 70$ | Strictly blocks payment gateway session creation. Sets transaction internal state to `HELD`. | Blocks checkout, displays *"Verifying for your safety"*, creates priority investigation case in queue, and broadcasts WebSocket alert via `/ws/alerts`. |

---

### FR2: Hybrid Scam & Behavioral Anomaly Detection

Evaluates transactions using a hybrid scoring architecture combining unsupervised behavioral baseline modelling with supervised scam classification and deterministic constraints.

#### Scam Taxonomy Matrix

| Scam Classification | Primary Technical Indicators | Velocity & Pattern Criteria | Hard Rule Overrides |
|---|---|---|---|
| **Impersonation** | High urgency flags, call state detection, newly registered payee. | Amount $> 5\times$ historic average; transaction within 10 mins of payee creation. | High risk block if transaction occurs during an active voice call with a new beneficiary. |
| **Phishing** | Lookalike merchant domains, unverified SSL certificates, spoofed headers. | Domain age $< 30$ days; structural similarity to target brand entities. | Direct block (score = 100) if domain matches blacklisted database. |
| **Fake Refund** | Inbound small credit followed immediately by outbound collect request. | Credit deposit succeeded within trailing 15-minute window before collect request. | Medium step-up enforced on all collect requests linked to recent credits. |
| **Investment Scam** | Sequential transfers to unverified corporate or high-risk accounts. | Rapidly escalating payment values sent to same payee over short duration. | Dynamic flag escalation upon 3rd sequential payment increment. |
| **Mule Account** | High node centrality, rapid fund dispersion across multi-hop edges. | High fan-in ratio ($> 10$ distinct senders/hr) combined with high pass-through velocity. | Absolute block if target account is an identified active mule node. |
| **Payment-Request** | Unexpected inbound collect requests via UPI rails. | Collect request initiated by unlinked payee without prior transaction history. | Enforce step-up warning explicitly displaying: *"This will DEBIT your account"*. |

#### Computer Vision & Perceptual Hashing (pHash)
Extracts 64-bit structural perceptual hashes from uploaded payment receipts and merchant landing page assets. Receipts or interface images exhibiting Hamming distances $d_H \le 10$ across disparate accounts are clustered to uncover syndicated scam campaigns.

---

### FR3: Loan Repayment Risk & Early Warning Engine

Maintains an independent Repayment Risk Engine operating on a $0\text{--}100$ scoring scale, running on a scheduled nightly batch frequency and dynamically executing upon any EMI payment event.

#### Quantitative Formulations

1. **EMI-to-Income Ratio ($R_{\text{EMI}}$)**:
   $$R_{\text{EMI}} = \frac{\sum_{i=1}^{M} \text{EMI}_i}{I_{\text{verified}}}$$
   Ratios $R_{\text{EMI}} \ge 0.40$ trigger elevated risk flags.

2. **Days Past Due (DPD) Buckets**:
   Categorizes repayment delay into discrete states: `DPD 0`, `DPD 1–30`, `DPD 30–60`, and `DPD 60+`.

3. **Late-Payment Velocity ($V_{\text{late}}$)**:
   Total count of delayed or partial EMI payments over trailing $W \in \{3, 6\}$ month windows.

4. **Income Trend Dynamics ($\Delta I$)**:
   $$\Delta I = \frac{\bar{I}_{\text{trailing3m}} - I_{\text{current}}}{\bar{I}_{\text{trailing3m}}}$$
   A reduction $\Delta I > 0.20$ (20% drop) triggers risk score escalation.

5. **Spending Spike & Stress Signals ($S_{\text{spend}}$)**:
   $$S_{\text{spend}} = \frac{E_{\text{current}}}{E_{\text{prior}}}$$
   Detects sudden month-over-month expenditure spikes and ATM cash burns.

6. **Debt Stress Metrics ($D_{\text{stress}}$)**:
   $$U_{\text{credit}} = \frac{\text{Balance}}{\text{Limit}}, \quad B_{\text{liquid}} = I_{\text{current}} - E_{\text{total}} - \sum \text{EMI}$$

7. **Net Cash Flow & Liquid Runway**:
   $$\text{Runway}_{\text{months}} = \frac{B_{\text{liquid}}}{\left| \min(0, \text{Net Cash Flow}) \right| + \epsilon}$$

8. **Fraud-to-Credit Loss Linkage ($L_{\text{fraud}}$)**:
   Confirmed fraud losses feed directly into the borrower's credit risk pipeline as an immediate liquidity shock:
   $$S_{\text{repayment}} = f(\dots, L_{\text{fraud}})$$

#### Repayment Risk Tiers

- **Healthy ($\text{Score} < 30$)**: Standard profile; automated servicing.
- **Watch ($30 \le \text{Score} < 55$)**: Early warning state; added to credit watchlist; soft spending nudges.
- **Stressed ($55 \le \text{Score} < 80$)**: High probability of default; triggers analyst assignment for proactive restructuring.
- **Default-Risk ($\text{Score} \ge 80$)**: Severe default likelihood; requires immediate manual case management, restructuring offers, or salary deduction hooks.

---

### FR4: Analyst Case Management, Mule Graphs & Explainability

An enterprise analyst investigation interface located at `/analyst`:

- **Algorithmic Priority Ranker**: Ingests high-risk holds and credit distress incidents, sorting the queue continuously:
  $$\text{Priority Score} = S_{\text{risk}} \times \text{Amount}_{\text{txn}} \times \log_{10}(\text{Exposure}_{\text{total}} + 1)$$
- **Case Decisions**: One-click actions for `[Approve / Clear]`, `[Block / Flag]`, and `[Proactive Restructure]`.
- **Plain-English Explainability Engine**: Converts internal rule codes and top local SHAP feature attribution values into concise, human-readable reason codes.
- **Interactive Mule-Ring Graph Topology**: Implemented with `react-force-graph-2d` under $k \le 4$ hop boundaries. Nodes exceeding Directed In-Degree Centrality $C_D^+ > 0.05$ or PageRank $PR > 0.015$ illuminate in bright red.
- **Read-Only Conversational LLM Assistant**: Natural language copilot queryable via `/assistant/chat` (e.g., *"Why was Rahul flagged?"*). Strict safety guardrails forbid the assistant from mutating risk scores or modifying case labels.
- **Live WebSocket Threat Feeds**: Real-time broadcast pushed to connected analyst terminals over `/ws/alerts`.

---

### FR5: Self-Learning Feedback Loop & Quantitative Governance

- **Closed-Loop Retraining**: Nightly jobs extract analyst-confirmed case decisions (Approve vs Block) and ground-truth loan repayment outcomes (Settled vs Defaulted).
- **Anti-Error Reinforcement**: Retraining operates strictly on human-validated ground truth to prevent bias amplification.
- **Shadow Mode Deployment**: Retrained candidate models run in shadow mode alongside production endpoints without mutating live decisions.
- **Population Stability Index (PSI)**:
  $$\text{PSI} = \sum_{i=1}^{B} \left( P_i - Q_i \right) \times \ln\left(\frac{P_i}{Q_i}\right)$$
  $\text{PSI} \ge 0.25$ indicates significant distribution drift, halting automated model promotion.
- **Kolmogorov-Smirnov (KS) Test**: Two-sample KS test evaluated on prediction probability distributions; $p < 0.05$ triggers an alert for manual review.

---

## 📡 API Reference

### Payments (`/payments`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/payments/precheck` | Synchronous risk scoring (SLA < 200ms). Returns `approve`, `step_up`, or `block`. |
| `POST` | `/payments/step-up/confirm` | Confirms OTP or acknowledgment challenge for medium-risk payments. |
| `POST` | `/payments/session` | Generates Juspay session token for approved transactions. |

### Case Management (`/cases`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cases` | Fetches investigation queue ordered by algorithmic Priority Score. |
| `GET` | `/cases/{case_id}` | Detailed case inspection including SHAP vectors and audit history. |
| `POST` | `/cases/action` | Executes analyst decision (`approve`, `block`, `restructure`). |

### Loans & Early Warning (`/loans`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/loans/{customer_id}` | Active loan obligations and aggregated repayment risk scores. |
| `GET` | `/loans/{customer_id}/credit-profile` | Complete 360-degree credit distress profile ($R_{\text{EMI}}$, runway, $\Delta I$). |
| `POST` | `/loans/calculate` | On-demand quantitative risk recalculation using FR3 mathematical formulas. |

### Analytics & Governance (`/analytics`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/mule-graph` | NetworkX multi-hop mule topology ($k \le 4$) with centrality and PageRank metrics. |
| `GET` | `/analytics/drift` | Quantitative drift evaluation (PSI and KS test). |
| `POST` | `/analytics/phash-check` | Checks receipt image pHash against known syndicate campaigns ($d_H \le 10$). |

### Real-Time & Assistant

| Method | Endpoint | Description |
|---|---|---|
| `WS` | `/ws/alerts` | Real-time threat feed broadcasting high-risk payment blocks and holds. |
| `POST` | `/assistant/chat` | Read-only conversational LLM assistant answering analyst inquiries. |
| `GET` | `/health` | Health check endpoint returning subsystem operational statuses. |

---

## 📁 Repository Structure

```
SentinelIQ/
├── backend/
│   ├── app/
│   │   ├── api/                  # REST & WebSocket route handlers
│   │   │   ├── analytics.py      # Mule graphs, drift, pHash
│   │   │   ├── assistant.py      # Read-only LLM conversational copilot
│   │   │   ├── cases.py          # Priority queue and analyst actions
│   │   │   ├── loans.py          # Loan distress & credit profiles
│   │   │   └── payments.py       # Pre-checkout scoring and step-up
│   │   ├── core/                 # Config (pydantic-settings), security, JWT
│   │   ├── db/                   # SQLAlchemy async session and declarative base
│   │   ├── ml/                   # Inference engines
│   │   │   ├── anomaly/          # Isolation Forest & PyTorch autoencoders
│   │   │   ├── explainability/   # Drift (PSI/KS) and SHAP attribution
│   │   │   ├── fraud/            # 6-class XGBoost scam classifier
│   │   │   ├── graph/            # NetworkX mule ring graph analytics
│   │   │   └── vision/           # Perceptual hashing (pHash)
│   │   ├── models/               # SQLAlchemy ORM entities
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Core domain services (Payment, Risk, Loan, Case)
│   │   ├── websocket/            # Live analyst alert broadcaster
│   │   └── main.py               # FastAPI entrypoint & middleware
│   ├── tests/
│   │   └── test_features.py      # Automated pytest suite (FR1-FR5)
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Marketing & product landing page
│   │   │   ├── shop/page.tsx     # Consumer checkout & precheck interceptor
│   │   │   └── analyst/page.tsx  # Enterprise analyst investigation suite
│   │   ├── components/
│   │   │   ├── analyst/          # MuleGraphView (react-force-graph-2d)
│   │   │   └── landing/          # Hero, Navbar, TrustStrip
│   │   └── lib/
│   │       └── api.ts            # Typed API client with resilient fallbacks
│   ├── .env.example
│   └── package.json
│
├── ml/                           # Model training pipelines (XGBoost, Drift, Autoencoder)
├── scripts/                      # Synthetic data generation pipelines
├── docker-compose.yml            # PostgreSQL 17 & Redis 7 services
└── README.md
```

---

## ⚡ Local Setup & Quick Start

### Prerequisites
- **Python**: 3.12 or 3.13
- **Node.js**: v20 or v22
- **Docker**: (Optional, for PostgreSQL 17 & Redis 7 containerization)

### 1. Infrastructure (Optional)
```bash
docker compose up -d
```

### 2. Backend Setup (FastAPI)
```powershell
cd backend
python -m venv .venv

# Activate on Windows:
.\.venv\Scripts\Activate.ps1
# Activate on Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup (Next.js 16)
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- Checkout Interceptor Sandbox: [http://localhost:3000/shop](http://localhost:3000/shop)
- Enterprise Analyst Dashboard: [http://localhost:3000/analyst](http://localhost:3000/analyst)

---

## 🧪 Running Automated Verification Tests

The backend includes a comprehensive test suite validating all functional requirements:

```powershell
cd backend
.\.venv\Scripts\pytest.exe -v tests/test_features.py
```

### Test Coverage Highlights (14/14 Passing):
- `test_fr1_low_risk_auto_approval` (Score < 40 -> Juspay session token created)
- `test_fr1_medium_risk_step_up_otp` (40 <= Score < 70 -> OTP step-up challenge)
- `test_fr1_step_up_confirmation_workflow` (Step-up confirmed -> approved checkout)
- `test_fr1_high_risk_block_and_hold` (Score >= 70 -> Block & queue ingestion)
- `test_fr2_impersonation_scam_rule` (Active voice call + new payee -> Hard override)
- `test_fr2_blacklisted_domain_override` (Blacklisted merchant -> 100 score block)
- `test_fr3_loan_risk_mathematical_formulations` ($R_{\text{EMI}}$, DPD, $\Delta I$, runway)
- `test_fr3_loan_api_endpoints` (Credit profile and loan distress calculation)
- `test_fr4_priority_score_formula` ($S_{\text{risk}} \times \text{Amount} \times \log_{10}(\text{Exposure}+1)$)
- `test_fr4_analyst_cases_and_actions` (Approve, Block, Restructure transitions)
- `test_fr4_interactive_mule_ring_graph` (NetworkX multi-hop topology $k \le 4$)
- `test_fr4_read_only_llm_assistant` (Conversational assistant without state mutation)
- `test_fr5_drift_monitoring_psi_and_ks` (Population Stability Index & KS test)
- `test_fr5_phash_group_scam_detection` (pHash Hamming distance $d_H \le 10$ syndicate clustering)

---

## 🔒 Security, RBI & DPDP Compliance

1. **RBI Explainability Guidelines**: Every intervention emits deterministic SHAP feature vectors and plain-English reason codes explaining why a payment was held or a loan flagged.
2. **DPDP Act (India) Compliance**: Device fingerprints and biometric indicators are hashed; no raw PII is exposed across public endpoints.
3. **Immutable Audit Ledger**: All decisions made by human analysts (Approve, Block, Restructure) are cryptographically logged with actor IDs and timestamps.
4. **Anti-Hallucination Guardrails**: The integrated conversational assistant operates in a strictly read-only capacity, preventing unauthorized state or score mutations.
