"""
SentinelIQ – Loan Data Loader

Reads generated CSV datasets at startup and builds comprehensive per-customer
lookup dictionaries. Assigns stable CUST-XXX aliases prioritizing active borrowers
across all 4 risk tiers (Stressed, Default-risk, Watch, Healthy) so the UI
preset buttons and manual searches always resolve to real data.

Features:
  - Multi-tier alias assignment (CUST-001 to CUST-XXX)
  - Resilient lookup by alias, customer UUID, or customer name
  - Dynamic on-the-fly synthesis for non-borrowers
  - In-memory loan restructuring execution with live state updates
"""

import os
import logging
from typing import Optional, Any
import numpy as np
import pandas as pd

logger = logging.getLogger("sentineliq.data_loader")

# ── Paths ──────────────────────────────────────────────────────────
_CURR_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/app/services/loan
_CANDIDATE_PATHS = [
    os.path.abspath(os.path.join(_CURR_DIR, "..", "..", "..", "..", "data", "generated")),
    os.path.abspath(os.path.join(_CURR_DIR, "..", "..", "..", "data", "generated")),
    os.path.abspath(os.path.join(os.getcwd(), "data", "generated")),
    os.path.abspath(os.path.join(os.getcwd(), "..", "data", "generated")),
]

_DATA_DIR = next((p for p in _CANDIDATE_PATHS if os.path.exists(p)), _CANDIDATE_PATHS[0])
logger.info("Resolved generated data directory: %s", _DATA_DIR)


# ── In-Memory Data Store ──────────────────────────────────────────
_customers_df: Optional[pd.DataFrame] = None
_loans_df: Optional[pd.DataFrame] = None
_risk_df: Optional[pd.DataFrame] = None
_income_df: Optional[pd.DataFrame] = None

# Maps CUST-XXX aliases <-> UUIDs
_alias_to_uuid: dict[str, str] = {}
_uuid_to_alias: dict[str, str] = {}


def _safe_read_csv(filename: str) -> Optional[pd.DataFrame]:
    """Read a CSV from the generated data directory, returning None on failure."""
    path = os.path.join(_DATA_DIR, filename)
    if not os.path.exists(path):
        logger.warning("Data file not found: %s", path)
        return None
    try:
        df = pd.read_csv(path)
        logger.info("Loaded %s (%d rows, %d cols)", filename, len(df), len(df.columns))
        return df
    except Exception as e:
        logger.error("Failed to read %s: %s", filename, e)
        return None


def load_all_data() -> bool:
    """
    Loads all generated CSV datasets into memory and builds lookup indices.
    Called once at backend startup. Returns True if at least customers loaded.
    """
    global _customers_df, _loans_df, _risk_df, _income_df
    global _alias_to_uuid, _uuid_to_alias

    _customers_df = _safe_read_csv("sentineliq_customers.csv")
    _loans_df = _safe_read_csv("sentineliq_loans.csv")
    _risk_df = _safe_read_csv("sentineliq_repayment_risk.csv")
    _income_df = _safe_read_csv("sentineliq_income_expense.csv")

    if _customers_df is None or _customers_df.empty:
        logger.error("No customer data found — loan service will use calculation fallback.")
        return False

    _alias_to_uuid.clear()
    _uuid_to_alias.clear()

    # Determine borrowers who have both a loan and a risk entry
    borrower_uuids = set()
    if _risk_df is not None and not _risk_df.empty:
        borrower_uuids = set(_risk_df["customer_id"].unique())

    # Categorize borrower UUIDs by stage for canonical preset assignment
    by_stage: dict[str, list[str]] = {
        "Stressed": [],
        "Default-risk": [],
        "Watch": [],
        "Healthy": [],
    }

    if _risk_df is not None and not _risk_df.empty:
        # Prioritize Default-risk with scam loss for high realism
        for _, row in _risk_df.iterrows():
            cid = row["customer_id"]
            st = str(row.get("stage", "Healthy"))
            if st in by_stage:
                # If Default-risk with scam loss, push to front
                if st == "Default-risk" and float(row.get("total_scam_loss", 0)) > 0:
                    by_stage[st].insert(0, cid)
                else:
                    by_stage[st].append(cid)

    # Pick the top 4 canonical presets: Stressed, Default-risk, Watch, Healthy
    ordered_uuids: list[str] = []
    seen = set()

    for target_stage in ["Stressed", "Default-risk", "Watch", "Healthy"]:
        candidates = [u for u in by_stage.get(target_stage, []) if u not in seen]
        if candidates:
            chosen = candidates[0]
            ordered_uuids.append(chosen)
            seen.add(chosen)

    # Append all remaining borrowers
    if _risk_df is not None:
        for cid in _risk_df["customer_id"].unique():
            if cid not in seen:
                ordered_uuids.append(cid)
                seen.add(cid)

    # Append all remaining non-borrower customers
    for cid in _customers_df["customer_id"].unique():
        if cid not in seen:
            ordered_uuids.append(cid)
            seen.add(cid)

    # Assign CUST-001, CUST-002, ...
    for idx, uuid_val in enumerate(ordered_uuids):
        alias = f"CUST-{idx + 1:03d}"
        _alias_to_uuid[alias] = uuid_val
        _uuid_to_alias[uuid_val] = alias

    logger.info(
        "Data loaded: %d customers, %d loans, %d risk profiles. "
        "Top aliases: CUST-001 to CUST-%03d",
        len(_customers_df),
        len(_loans_df) if _loans_df is not None else 0,
        len(_risk_df) if _risk_df is not None else 0,
        min(4, len(_alias_to_uuid)),
    )
    return True


def ensure_data_loaded():
    """Ensure generated CSV data is loaded into memory."""
    if not is_data_loaded():
        load_all_data()


def resolve_customer_id(query: str) -> str:
    """
    Resolve a query string to a customer UUID. Supports:
    1. Direct alias match (e.g. 'CUST-001' or 'cust-001')
    2. Direct UUID match
    3. Customer name substring match
    """
    ensure_data_loaded()
    if not query:
        return query


    cleaned = query.strip()
    upper = cleaned.upper()

    # 1. Alias lookup
    if upper in _alias_to_uuid:
        return _alias_to_uuid[upper]

    # 2. Check if already known UUID
    if cleaned in _uuid_to_alias:
        return cleaned

    # 3. Search in customer dataframe by name
    if _customers_df is not None and not _customers_df.empty:
        # Exact UUID match in df
        match = _customers_df[_customers_df["customer_id"] == cleaned]
        if not match.empty:
            return cleaned

        # Name match
        name_match = _customers_df[_customers_df["name"].str.contains(cleaned, case=False, na=False)]
        if not name_match.empty:
            return name_match.iloc[0]["customer_id"]

    return cleaned


def get_customer_row(customer_id: str) -> Optional[dict]:
    """Look up customer demographic row by UUID or alias."""
    if _customers_df is None:
        return None
    uuid_val = resolve_customer_id(customer_id)
    match = _customers_df[_customers_df["customer_id"] == uuid_val]
    if match.empty:
        return None
    return match.iloc[0].to_dict()


def get_loan_rows(customer_id: str) -> list[dict]:
    """Return all loan rows for a given customer, synthesizing if necessary."""
    uuid_val = resolve_customer_id(customer_id)
    if _loans_df is not None and not _loans_df.empty:
        matches = _loans_df[_loans_df["customer_id"] == uuid_val]
        if not matches.empty:
            return matches.to_dict("records")

    # If customer exists in customers_df but has no loan record, synthesize one
    cust = get_customer_row(customer_id)
    if cust:
        income = float(cust.get("monthly_income", 50000.0))
        # Synthesize a realistic healthy loan
        principal = round(income * 10, 2)
        rate = 11.5
        tenure = 36
        r = (rate / 100) / 12
        emi = round((principal * r * (1 + r) ** tenure) / ((1 + r) ** tenure - 1), 2)
        synthetic_loan = {
            "loan_id": f"LOAN-SYN-{uuid_val[:8]}",
            "customer_id": uuid_val,
            "principal": principal,
            "interest_rate": rate,
            "tenure_months": tenure,
            "emi": emi,
            "outstanding_balance": round(principal * 0.65, 2),
            "emi_to_income_ratio": round(emi / income, 3),
            "dpd_bucket": "0",
            "late_payment_count": 0,
            "income_trend_drop_pct": 0.0,
            "spending_spike_flag": False,
            "recent_scam_loss_flag": False,
            "status": "Healthy",
        }
        return [synthetic_loan]

    return []


def get_risk_row(customer_id: str) -> Optional[dict]:
    """Return the repayment risk profile row for a customer."""
    uuid_val = resolve_customer_id(customer_id)
    if _risk_df is not None and not _risk_df.empty:
        match = _risk_df[_risk_df["customer_id"] == uuid_val]
        if not match.empty:
            return match.iloc[0].to_dict()

    # Synthesize baseline risk row if customer exists
    cust = get_customer_row(customer_id)
    if cust:
        income = float(cust.get("monthly_income", 50000.0))
        loans = get_loan_rows(customer_id)
        emi = loans[0]["emi"] if loans else round(income * 0.25, 2)
        ratio = round(emi / income, 3)
        return {
            "customer_id": uuid_val,
            "emi": emi,
            "outstanding_balance": round(income * 6.5, 2),
            "base_monthly_income": income,
            "income_trend_drop_pct": 0.0,
            "current_monthly_income": income,
            "spending_spike_flag": False,
            "total_scam_loss": 0.0,
            "recent_scam_loss_flag": False,
            "net_cash_flow": round(income * 0.35, 2),
            "cash_runway_months": 8.5,
            "emi_to_income_ratio": ratio,
            "late_payment_count": 0,
            "dpd_days": 0,
            "dpd_bucket": "0",
            "credit_utilization_pct": 32.0,
            "repayment_score": 88.0,
            "stage": "Healthy",
        }

    return None


def get_income_row(customer_id: str) -> Optional[dict]:
    """Return income/expense trajectory row for a customer."""
    uuid_val = resolve_customer_id(customer_id)
    if _income_df is not None and not _income_df.empty:
        match = _income_df[_income_df["customer_id"] == uuid_val]
        if not match.empty:
            return match.iloc[0].to_dict()

    cust = get_customer_row(customer_id)
    if cust:
        inc = float(cust.get("monthly_income", 50000.0))
        return {
            "customer_id": uuid_val,
            "base_monthly_income": inc,
            "income_trend_drop_pct": 0.0,
            "current_monthly_income": inc,
            "spending_spike_flag": False,
        }
    return None


def get_customer_alias(customer_id: str) -> str:
    """Return the CUST-XXX alias for a UUID, or the input if not found."""
    return _uuid_to_alias.get(customer_id, customer_id)


def list_all_customer_aliases() -> list[dict]:
    """
    Return a list of customer presets for the UI, ordered by canonical presets first.
    Returns: [{alias, uuid, name, stage, emi, monthly_income}]
    """
    if _customers_df is None:
        return []

    result = []
    for alias, uuid_val in _alias_to_uuid.items():
        row = _customers_df[_customers_df["customer_id"] == uuid_val]
        name = row.iloc[0]["name"] if not row.empty else "Customer"
        income = float(row.iloc[0]["monthly_income"]) if not row.empty else 50000.0

        risk = get_risk_row(uuid_val)
        stage = risk.get("stage", "Unknown") if risk else "Healthy"
        emi = float(risk.get("emi", 0.0)) if risk else 0.0

        result.append({
            "alias": alias,
            "uuid": uuid_val,
            "name": name,
            "stage": stage,
            "monthly_income": income,
            "emi": emi,
        })
    return result


def restructure_customer_loan(customer_id: str, additional_months: int = 12) -> dict[str, Any]:
    """
    Applies loan restructuring by extending tenure, reducing monthly EMI,
    and recalculating repayment risk metrics directly in memory.
    """
    global _loans_df, _risk_df

    uuid_val = resolve_customer_id(customer_id)
    cust = get_customer_row(uuid_val)
    loans = get_loan_rows(uuid_val)
    risk = get_risk_row(uuid_val)

    if not loans:
        raise ValueError(f"No loans found for customer {customer_id}")

    loan = loans[0]
    prev_emi = float(loan.get("emi", 30000.0))
    prev_tenure = int(loan.get("tenure_months", 36))
    principal = float(loan.get("outstanding_balance", loan.get("principal", 200000.0)))
    rate = float(loan.get("interest_rate", 12.0))
    prev_stage = str(risk.get("stage", "Stressed")) if risk else "Stressed"

    # New extended tenure
    new_tenure = prev_tenure + additional_months
    r_monthly = (rate / 100) / 12
    # Standard amortization: P * r * (1+r)^n / ((1+r)^n - 1)
    new_emi = round(principal * r_monthly * (1 + r_monthly) ** new_tenure / ((1 + r_monthly) ** new_tenure - 1), 2)

    # Current income
    income = float(cust.get("monthly_income", 60000.0)) if cust else 60000.0
    prev_ratio = round(prev_emi / income, 3)
    new_ratio = round(new_emi / income, 3)

    # New stage calculation
    if new_ratio < 0.35:
        new_stage = "Healthy"
    elif new_ratio < 0.45:
        new_stage = "Watch"
    else:
        new_stage = "Stressed"

    # Update in-memory dataframes if available
    if _loans_df is not None:
        idx = _loans_df[_loans_df["customer_id"] == uuid_val].index
        if len(idx) > 0:
            _loans_df.loc[idx, "tenure_months"] = new_tenure
            _loans_df.loc[idx, "emi"] = new_emi
            _loans_df.loc[idx, "emi_to_income_ratio"] = new_ratio
            _loans_df.loc[idx, "status"] = new_stage

    if _risk_df is not None:
        idx = _risk_df[_risk_df["customer_id"] == uuid_val].index
        if len(idx) > 0:
            _risk_df.loc[idx, "emi"] = new_emi
            _risk_df.loc[idx, "emi_to_income_ratio"] = new_ratio
            _risk_df.loc[idx, "stage"] = new_stage
            # Boost score
            cur_score = float(_risk_df.loc[idx, "repayment_score"].values[0])
            _risk_df.loc[idx, "repayment_score"] = min(95.0, round(cur_score + 22.0, 1))

    return {
        "success": True,
        "customer_id": _uuid_to_alias.get(uuid_val, uuid_val),
        "previous_emi": prev_emi,
        "new_emi": new_emi,
        "previous_tenure_months": prev_tenure,
        "new_tenure_months": new_tenure,
        "previous_emi_ratio": prev_ratio,
        "new_emi_ratio": new_ratio,
        "previous_stage": prev_stage,
        "new_stage": new_stage,
        "emi_reduction": round(prev_emi - new_emi, 2),
    }


def is_data_loaded() -> bool:
    """Check if data has been successfully loaded."""
    return _customers_df is not None and not _customers_df.empty
