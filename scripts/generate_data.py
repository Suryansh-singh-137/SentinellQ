"""
SentinelIQ Synthetic Data Generation Pipeline
Generates synthetic data for customer profiles, devices, merchants, beneficiaries,
transactions (digital & cash channels), loans, repayments, and income/expenses.
Injects structured scam taxonomies:
- Impersonation Scams
- Phishing & Lookalike Merchant Scams
- Fake Refund Scams
- Investment Scams
- Mule Account Networks
- Payment-Request (Collect) Scams
"""

import os
import sys
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from faker import Faker

# Resolve repository paths where generated data should go
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_GENERATED_DIR = os.path.join(BASE_DIR, "data", "generated")

# Initialize Faker with Indian locale for Consilium'26 relevance
fake = Faker('en_IN')

# Architecture Scale Requirements
NUM_CUSTOMERS = 10000
NUM_MERCHANTS = 1000
NUM_TRANSACTIONS = 1000000
FRAUD_RATE = 0.015  # 1-2% baseline noise rate


def generate_sentineliq_dataset(
    num_customers: int = NUM_CUSTOMERS,
    num_merchants: int = NUM_MERCHANTS,
    num_transactions: int = NUM_TRANSACTIONS,
    fraud_rate: float = FRAUD_RATE,
):
    # 1. Customers & Devices Table
    print(f"Generating {num_customers:,} Customers and Devices...")
    customers = []
    for _ in range(num_customers):
        monthly_income = round(random.uniform(15000, 250000), 2)
        customers.append({
            "customer_id": fake.uuid4(),
            "name": fake.name(),
            "age": random.randint(18, 70),
            "city": fake.city(),
            "kyc_status": random.choice(["Verified", "Pending"]),
            "segment": random.choice(["Retail", "Prime", "Student"]),
            "monthly_income": monthly_income,
            "device_fingerprint": fake.sha256()[:16],
            "ip_address": fake.ipv4(),
            "geolocation": f"{fake.latitude()}, {fake.longitude()}",
        })
    df_customers = pd.DataFrame(customers)

    # 2. Merchants & Reputation Table
    print(f"Generating {num_merchants:,} Merchants...")
    merchants = []
    for _ in range(num_merchants):
        is_scam_site = random.random() < 0.03
        merchants.append({
            "merchant_id": fake.uuid4(),
            "name": fake.company(),
            "category": fake.bs(),
            "domain": fake.domain_name(),
            "risk_score": random.randint(80, 100) if is_scam_site else random.randint(0, 30),
            "status": "Blocked" if is_scam_site else random.choice(["Normal", "Watch"]),
            "report_count": random.randint(3, 50) if is_scam_site else 0,
        })
    df_merchants = pd.DataFrame(merchants)

    # 3. Loans, Repayments & Early Warning Trajectories Table
    print("Generating Loan Portfolios and Repayment Risk...")
    loans = []
    for cust in customers:
        if random.random() < 0.35:  # ~35% of customers hold loans
            income = cust["monthly_income"]
            emi = round(random.uniform(0.1, 0.6) * income, 2)
            emi_to_income = round(emi / income, 2)

            # Inject Borrower Distress Trajectories
            dpd_bucket = random.choice([0, 0, random.randint(1, 30), random.randint(30, 60), random.randint(60, 90)])
            is_distressed = emi_to_income > 0.45 or dpd_bucket > 30

            loans.append({
                "loan_id": fake.uuid4(),
                "customer_id": cust["customer_id"],
                "principal": round(random.uniform(50000, 1500000), 2),
                "outstanding_balance": round(random.uniform(10000, 1400000), 2),
                "emi": emi,
                "emi_to_income_ratio": emi_to_income,
                "dpd_bucket": dpd_bucket,
                "late_payment_count": random.randint(1, 4) if is_distressed else 0,
                "income_trend_drop_pct": round(random.uniform(15, 50), 2) if is_distressed else 0.0,
                "spending_spike_flag": is_distressed and random.random() > 0.5,
                "debt_stress_flag": is_distressed,
                "recent_scam_loss_flag": random.random() < 0.05,
                "status": "Stressed" if is_distressed else "Healthy",
            })
    df_loans = pd.DataFrame(loans)

    # 4. Multi-Channel Transactions & Scam Scenarios Table
    print(f"Generating {num_transactions:,} Transactions & Scam Injections...")
    transactions = []
    channels = ["UPI", "wallet", "card", "net banking", "cash_atm", "cash_agent"]
    scam_types = ["Impersonation", "Phishing", "Fake Refund", "Investment", "Mule Account", "Payment-Request"]

    cust_ids = df_customers['customer_id'].tolist()
    merch_ids = df_merchants['merchant_id'].tolist()

    for _ in range(num_transactions):
        is_fraud = random.random() < fraud_rate
        channel = random.choice(channels)
        scam_type = random.choice(scam_types) if is_fraud else "None"

        tx = {
            "transaction_id": fake.uuid4(),
            "customer_id": random.choice(cust_ids),
            "merchant_id": random.choice(merch_ids) if random.random() > 0.2 else None,
            "channel": channel,
            "amount": round(random.uniform(50, 25000), 2),
            "timestamp": fake.date_time_between(start_date="-6m", end_date="now"),
            "is_synthetic": True,
            "fraud_score": random.randint(85, 100) if is_fraud else random.randint(0, 40),
            "scam_type": scam_type,
            "juspay_order_id": fake.uuid4(),
        }

        # Apply specific scenario logic to match SentinelIQ anomaly engine
        if is_fraud:
            if scam_type == "Investment":
                tx["amount"] = tx["amount"] * random.uniform(3, 8)  # Escalating amounts
            elif scam_type == "Mule Account":
                tx["channel"] = random.choice(["UPI", "cash_agent"])  # Rapid fan-in / cash-out
            elif scam_type == "Phishing":
                tx["channel"] = "net banking"
            elif scam_type == "Payment-Request":
                tx["channel"] = "UPI"

        transactions.append(tx)

    df_transactions = pd.DataFrame(transactions)
    print("Engine generation complete.")

    return {
        "customers": df_customers,
        "merchants": df_merchants,
        "loans": df_loans,
        "transactions": df_transactions,
    }


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    # Ensure target output directory exists in the repo
    os.makedirs(DATA_GENERATED_DIR, exist_ok=True)
    output_file = os.path.join(DATA_GENERATED_DIR, "sentineliq_transactions.csv")

    datasets = generate_sentineliq_dataset()

    print(f"Saving transactions to {output_file}...")
    datasets["transactions"].to_csv(output_file, index=False)
    print(f"[OK] Saved {len(datasets['transactions']):,} transactions to {output_file}")
