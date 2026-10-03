# SentinelIQ Machine Learning & AI Subsystem

Welcome to the **SentinelIQ ML Subsystem**. This directory is dedicated to the research, model training, anomaly detection, graph analytics, and model governance components of the SentinelIQ platform.

---

## 🎯 Objectives & Architecture

SentinelIQ employs a hybrid AI/ML architecture designed to achieve **sub-50ms inference latency** for the real-time transaction scoring SLA (< 200ms end-to-end):

```
+-----------------------------------------------------------------------------------+
|                             SENTINELIQ ANALYTICS ENGINE                           |
+-------------------+-------------------+-------------------+-----------------------+
|  SUPERVISED ML    |   UNSUPERVISED    |  GRAPH ANALYTICS  |   COMPUTER VISION     |
| XGBoost 6-Class   | Isolation Forest  |    NetworkX       |  Perceptual Hashing   |
| Scam Classifier   | & Autoencoders    |  Mule Ring Hops   | Lookalike Site/Images |
+-------------------+-------------------+-------------------+-----------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           EXPLAINABILITY LAYER (SHAP)                             |
|          Feature Contribution Vectors converted to Plain-English Reasons          |
+-----------------------------------------------------------------------------------+
```

---

## 🔬 Directory Structure

```
ml/
├── models/             # Saved model weights (XGBoost JSON, PyTorch .pt, ONNX)
├── artifacts/          # Evaluation reports, confusion matrices, SHAP plots
├── training/           # Reproducible training pipelines
│   ├── train_scam_classifier.py   # Supervised 6-class XGBoost model
│   ├── train_anomaly_detector.py  # Isolation Forest & Autoencoder baselines
│   └── evaluate_drift.py          # PSI (Population Stability Index) & KS test
└── experiments/        # Prototyping, feature engineering benchmarks, notebooks
```

---

## 🛡️ The 6 Target Scam Taxonomies

Every incoming transaction is classified into one of 6 discrete scam profiles:

| Scam Classification | Primary Technical Indicators | Velocity & Pattern Criteria |
|---|---|---|
| **1. Impersonation** | High urgency flags, voice call during transfer, new beneficiary | Amount > 5x historic avg; transaction within 10m of payee creation |
| **2. Phishing** | Lookalike domains, spoofed headers, newly registered merchants | Domain age < 30 days; visual/structural similarity to target brands |
| **3. Fake Refund** | Inbound small credit followed by outbound collect request | Credit deposit succeeded within trailing 15 mins before collect request |
| **4. Investment Scam** | Escalating payments to unverified corporate or high-risk accounts | Sequential increments sent to same payee over a short duration |
| **5. Mule Account** | High node centrality ($C_D^+ > 0.05$), rapid pass-through velocity | High fan-in ratio (>10 distinct senders/hr) combined with high fan-out |
| **6. Payment-Request** | Unexpected inbound UPI collect requests from unknown payees | Collect request initiated without prior transaction history |

---

## 📊 Model Governance & Drift Monitoring

To ensure regulatory compliance (RBI explainability & DPDP Act):

1. **Explainable AI (SHAP)**:
   - Every inference must output feature attribution values for top contributing risk drivers.
2. **Quantitative Drift Monitoring**:
   - **Population Stability Index (PSI)**:
     $$\text{PSI} = \sum_{i=1}^{B} (P_i - Q_i) \times \ln\left(\frac{P_i}{Q_i}\right)$$
     - $\text{PSI} < 0.10$: Minimal drift; stable.
     - $0.10 \le \text{PSI} < 0.25$: Moderate drift; warning flag.
     - $\text{PSI} \ge 0.25$: Significant distribution drift; triggers shadow model quarantine.
   - **Kolmogorov-Smirnov (KS) Test**: Two-sample KS test evaluated on prediction probability distributions ($p < 0.05$ flags manual model review).

---

## 🚀 How to Contribute

1. **Set Up the Environment**:
   ```bash
   cd backend
   .\.venv\Scripts\Activate.ps1   # Windows
   pip install -r requirements.txt
   ```
2. **Run Training**:
   ```bash
   cd ml/training
   python train_scam_classifier.py
   python train_anomaly_detector.py
   ```
3. **Run Drift Evaluation**:
   ```bash
   python evaluate_drift.py
   ```
4. **Save Models**:
   - Place validated models in `ml/models/<model_name>_v<version>.json`.
   - Update model cards and metrics in `ml/artifacts/`.
