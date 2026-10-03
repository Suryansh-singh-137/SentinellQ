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

# Ensure the scripts directory is in sys.path so modules can be imported anywhere
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

try:
    from scam_injectors import inject_scam_patterns
    from loan_trajectories import generate_loan_trajectories
except ImportError:
    from scripts.scam_injectors import inject_scam_patterns
    from scripts.loan_trajectories import generate_loan_trajectories

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

    # 3. Multi-Channel Transactions (Base Generation)
    print(f"Generating {num_transactions:,} Base Transactions...")
    transactions = []
    channels = ["UPI", "wallet", "card", "net banking", "cash_atm", "cash_agent"]

    cust_ids = df_customers['customer_id'].tolist()
    merch_ids = df_merchants['merchant_id'].tolist()

    for _ in range(num_transactions):
        tx = {
            "transaction_id": fake.uuid4(),
            "customer_id": random.choice(cust_ids),
            "merchant_id": random.choice(merch_ids) if random.random() > 0.2 else None,
            "channel": random.choice(channels),
            "amount": round(random.uniform(50, 25000), 2),
            "timestamp": fake.date_time_between(start_date="-6m", end_date="now"),
            "is_synthetic": True,
            "juspay_order_id": fake.uuid4(),
        }
        transactions.append(tx)

    df_transactions = pd.DataFrame(transactions)
    
    # 4. Inject Complex Scam Archetypes
    print(f"Injecting 6 Scam Archetypes at {fraud_rate*100:.2f}% Baseline Rate...")
    df_transactions = inject_scam_patterns(df_transactions, df_customers, fraud_rate)
    
    # 5. Loan Portfolios, Repayments & Early Warning Trajectories
    print("Generating Loan Portfolios and Repayment Risk...")
    loan_datasets = generate_loan_trajectories(df_customers, df_transactions)

    print("Engine generation complete.")

    final_datasets = {
        "customers": df_customers,
        "merchants": df_merchants,
        "transactions": df_transactions,
    }
    
    # Merge all generated loan datasets into the final output
    final_datasets.update(loan_datasets)

    return final_datasets


import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="SentinelIQ Synthetic Financial Data Generator")
    parser.add_argument("--customers", type=int, default=NUM_CUSTOMERS, help=f"Number of synthetic customers to generate (default: {NUM_CUSTOMERS})")
    parser.add_argument("--merchants", type=int, default=NUM_MERCHANTS, help=f"Number of synthetic merchants to generate (default: {NUM_MERCHANTS})")
    parser.add_argument("--transactions", type=int, default=NUM_TRANSACTIONS, help=f"Number of transactions to generate (default: {NUM_TRANSACTIONS})")
    parser.add_argument("--fraud-rate", type=float, default=FRAUD_RATE, help=f"Baseline fraud rate (default: {FRAUD_RATE})")
    parser.add_argument("--output-dir", type=str, default=None, help="Directory to save generated datasets")
    parser.add_argument("--export-all", action="store_true", help="Export all tables instead of only transactions")
    return parser.parse_args()

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    args = parse_args()
    print("=" * 60)
    print("Initializing SentinelIQ Synthetic Data Generation Pipeline")
    print(f"  Customers:    {args.customers:,}")
    print(f"  Merchants:    {args.merchants:,}")
    print(f"  Transactions: {args.transactions:,}")
    print(f"  Fraud Rate:   {args.fraud_rate * 100:.2f}%")
    print("=" * 60)

    # Ensure target output directory exists in the repo
    output_dir = args.output_dir if args.output_dir else DATA_GENERATED_DIR
    os.makedirs(output_dir, exist_ok=True)
    
    datasets = generate_sentineliq_dataset(
        num_customers=args.customers,
        num_merchants=args.merchants,
        num_transactions=args.transactions,
        fraud_rate=args.fraud_rate,
    )

    if args.export_all:
        for name, df in datasets.items():
            out_path = os.path.join(output_dir, f"sentineliq_{name}.csv")
            df.to_csv(out_path, index=False)
            print(f"[OK] Saved {name} ({len(df):,} records) to {out_path}")
    else:
        output_file = os.path.join(output_dir, "sentineliq_transactions.csv")
        print(f"Saving transactions to {output_file}...")
        datasets["transactions"].to_csv(output_file, index=False)
        print(f"[OK] Saved {len(datasets['transactions']):,} transactions to {output_file}")
