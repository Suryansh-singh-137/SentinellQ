"""
SentinelIQ - Supervised 6-Class Scam Classifier Pipeline
Trains an XGBoost multi-class classifier to categorize transaction risk into:
0: Normal / Legitimate
1: Impersonation Scam
2: Phishing Scam
3: Fake Refund Scam
4: Investment Scam
5: Mule Account Network
6: Payment-Request (Collect) Scam
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, f1_score
import xgboost as xgb
import shap

SCAM_CLASSES = {
    0: "Legitimate",
    1: "Impersonation",
    2: "Phishing",
    3: "Fake_Refund",
    4: "Investment_Scam",
    5: "Mule_Account",
    6: "Payment_Request"
}

FEATURE_COLUMNS = [
    "amount",
    "amount_to_avg_ratio",
    "velocity_1m",
    "velocity_5m",
    "velocity_1h",
    "beneficiary_age_minutes",
    "device_switch_flag",
    "is_voice_call_active",
    "is_unlinked_collect_req",
    "recent_small_credit_inflow",
    "merchant_risk_score",
    "in_degree_centrality",
    "pagerank_score"
]


def load_dataset(data_path: str = None) -> pd.DataFrame:
    """Loads feature dataset or generates baseline training synthetic sample."""
    if data_path and os.path.exists(data_path):
        return pd.read_parquet(data_path)
    
    # Baseline synthetic seed for pipeline verification
    np.random.seed(42)
    n_samples = 2000
    df = pd.DataFrame({
        "amount": np.random.exponential(scale=3000, size=n_samples),
        "amount_to_avg_ratio": np.random.lognormal(mean=0, sigma=0.8, size=n_samples),
        "velocity_1m": np.random.poisson(lam=0.5, size=n_samples),
        "velocity_5m": np.random.poisson(lam=1.2, size=n_samples),
        "velocity_1h": np.random.poisson(lam=3.0, size=n_samples),
        "beneficiary_age_minutes": np.random.exponential(scale=1000, size=n_samples),
        "device_switch_flag": np.random.binomial(n=1, p=0.08, size=n_samples),
        "is_voice_call_active": np.random.binomial(n=1, p=0.04, size=n_samples),
        "is_unlinked_collect_req": np.random.binomial(n=1, p=0.03, size=n_samples),
        "recent_small_credit_inflow": np.random.binomial(n=1, p=0.02, size=n_samples),
        "merchant_risk_score": np.random.uniform(0.0, 1.0, size=n_samples),
        "in_degree_centrality": np.random.beta(a=0.5, b=5.0, size=n_samples),
        "pagerank_score": np.random.beta(a=0.5, b=10.0, size=n_samples),
        "scam_label": np.random.choice([0, 1, 2, 3, 4, 5, 6], size=n_samples, p=[0.70, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05])
    })

    # Correlate features based on archetype signatures
    mask_imp = df["scam_label"] == 1
    df.loc[mask_imp, "is_voice_call_active"] = 1
    df.loc[mask_imp, "beneficiary_age_minutes"] = np.random.uniform(1, 15, size=mask_imp.sum())
    df.loc[mask_imp, "amount_to_avg_ratio"] = np.random.uniform(4.0, 10.0, size=mask_imp.sum())

    mask_phish = df["scam_label"] == 2
    df.loc[mask_phish, "device_switch_flag"] = 1
    df.loc[mask_phish, "merchant_risk_score"] = np.random.uniform(0.8, 1.0, size=mask_phish.sum())

    mask_refund = df["scam_label"] == 3
    df.loc[mask_refund, "recent_small_credit_inflow"] = 1
    df.loc[mask_refund, "is_unlinked_collect_req"] = 1

    mask_invest = df["scam_label"] == 4
    df.loc[mask_invest, "amount_to_avg_ratio"] = np.random.uniform(3.0, 8.0, size=mask_invest.sum())
    df.loc[mask_invest, "velocity_1h"] = np.random.randint(5, 15, size=mask_invest.sum())

    mask_mule = df["scam_label"] == 5
    df.loc[mask_mule, "in_degree_centrality"] = np.random.uniform(0.1, 0.4, size=mask_mule.sum())
    df.loc[mask_mule, "pagerank_score"] = np.random.uniform(0.05, 0.25, size=mask_mule.sum())
    df.loc[mask_mule, "velocity_1m"] = np.random.randint(3, 8, size=mask_mule.sum())

    mask_payreq = df["scam_label"] == 6
    df.loc[mask_payreq, "is_unlinked_collect_req"] = 1
    df.loc[mask_payreq, "velocity_1h"] = 0

    return df


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def train_scam_model(output_dir: str = MODELS_DIR):
    """Trains, evaluates, and exports the XGBoost scam classifier."""
    print("Loading transaction dataset...")
    df = load_dataset()
    X = df[FEATURE_COLUMNS]
    y = df["scam_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training XGBoost classifier on {len(X_train)} samples...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.08,
        objective="multi:softprob",
        num_class=len(SCAM_CLASSES),
        tree_method="hist",
        random_state=42
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print("\n--- Model Evaluation Report ---")
    print(classification_report(y_test, preds, target_names=[SCAM_CLASSES[i] for i in sorted(SCAM_CLASSES.keys())]))

    # Export model artifact
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "scam_classifier_v1.json")
    model.save_model(model_path)
    print(f"Model successfully exported to: {model_path}")

    # Build SHAP TreeExplainer baseline
    print("Generating SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    return model, explainer


if __name__ == "__main__":
    train_scam_model()
