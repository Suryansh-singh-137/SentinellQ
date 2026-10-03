import numpy as np
import pandas as pd
from datetime import timedelta
import random

def _inject_impersonation(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_mask: pd.Series) -> pd.DataFrame:
    """
    Impersonation: Simulate a new payee being added, accompanied immediately by urgency signals, 
    a transaction amount far above the customer's historical average, and a "call flag" 
    indicating the user was actively on a phone call during the transfer.
    """
    idx = fraud_mask[fraud_mask].index
    if len(idx) == 0: return df_transactions
    
    # Increase amount significantly
    df_transactions.loc[idx, 'amount'] = df_transactions.loc[idx, 'amount'] * np.random.uniform(5, 15, size=len(idx))
    
    # Add new flags specific to impersonation
    df_transactions.loc[idx, 'is_voice_call_active'] = True
    df_transactions.loc[idx, 'beneficiary_age_minutes'] = np.random.uniform(1, 30, size=len(idx))
    df_transactions.loc[idx, 'urgency_signal'] = True
    
    df_transactions.loc[idx, 'scam_type'] = 'Impersonation'
    return df_transactions

def _inject_phishing(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_mask: pd.Series) -> pd.DataFrame:
    """
    Phishing: Isolate transactions on the "net banking" channel, mapping them to lookalike 
    merchant domains and flagging the event as originating from a completely new or anomalous device fingerprint.
    """
    idx = fraud_mask[fraud_mask].index
    if len(idx) == 0: return df_transactions
    
    df_transactions.loc[idx, 'channel'] = 'net banking'
    df_transactions.loc[idx, 'device_switch_flag'] = True
    # Assume merchant_id points to a risky domain, or flag it specifically
    df_transactions.loc[idx, 'lookalike_domain_flag'] = True
    
    df_transactions.loc[idx, 'scam_type'] = 'Phishing'
    return df_transactions

def _inject_fake_refund(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_mask: pd.Series) -> pd.DataFrame:
    """
    Fake Refund: Generate a sequence where a small micro-credit is deposited, 
    immediately followed by a large pull or debit request.
    """
    idx = fraud_mask[fraud_mask].index
    if len(idx) == 0: return df_transactions
    
    df_transactions.loc[idx, 'recent_small_credit_inflow'] = True
    df_transactions.loc[idx, 'is_unlinked_collect_req'] = True
    # The actual transaction is the large pull
    df_transactions.loc[idx, 'amount'] = df_transactions.loc[idx, 'amount'] * np.random.uniform(2, 5, size=len(idx))
    
    df_transactions.loc[idx, 'scam_type'] = 'Fake Refund'
    return df_transactions

def _inject_investment(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_mask: pd.Series) -> pd.DataFrame:
    """
    Investment Scam: Create escalating transfer ladders by simulating repeated, 
    progressively rising payment amounts sent to a newly added payee over a span of several days.
    """
    idx = fraud_mask[fraud_mask].index
    if len(idx) == 0: return df_transactions
    
    # We can flag these as part of an escalating ladder
    df_transactions.loc[idx, 'escalating_transfer_ladder'] = True
    df_transactions.loc[idx, 'beneficiary_age_minutes'] = np.random.uniform(60*24, 60*24*7, size=len(idx)) # 1 to 7 days
    df_transactions.loc[idx, 'amount'] = df_transactions.loc[idx, 'amount'] * np.random.uniform(3, 10, size=len(idx))
    
    df_transactions.loc[idx, 'scam_type'] = 'Investment'
    return df_transactions

def _inject_mule_account(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_mask: pd.Series) -> pd.DataFrame:
    """
    Mule Account: Construct complex fan-in patterns where multiple distinct senders pay into a single account, 
    followed immediately by rapid fan-out transfers or bursts of cash-point (ATM/agent) withdrawals.
    """
    idx = fraud_mask[fraud_mask].index
    if len(idx) == 0: return df_transactions
    
    # Flag rapid fan-in / fan-out
    df_transactions.loc[idx, 'high_fan_in_out_velocity'] = True
    df_transactions.loc[idx, 'channel'] = np.random.choice(['UPI', 'cash_agent', 'cash_atm'], size=len(idx))
    
    df_transactions.loc[idx, 'scam_type'] = 'Mule Account'
    return df_transactions

def _inject_payment_request(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_mask: pd.Series) -> pd.DataFrame:
    """
    Payment-Request Scam: Inject unexpected UPI collect requests targeting otherwise dormant customer accounts.
    """
    idx = fraud_mask[fraud_mask].index
    if len(idx) == 0: return df_transactions
    
    df_transactions.loc[idx, 'channel'] = 'UPI'
    df_transactions.loc[idx, 'is_unlinked_collect_req'] = True
    df_transactions.loc[idx, 'dormant_account_flag'] = True
    
    df_transactions.loc[idx, 'scam_type'] = 'Payment-Request'
    return df_transactions

def inject_scam_patterns(df_transactions: pd.DataFrame, df_customers: pd.DataFrame, fraud_rate: float) -> pd.DataFrame:
    """
    Primary orchestrator function that applies the six archetype functions and returns 
    the mutated DataFrame ready for model training.
    """
    # Create required feature columns if they don't exist
    new_cols = {
        'is_voice_call_active': False,
        'beneficiary_age_minutes': -1.0,
        'urgency_signal': False,
        'device_switch_flag': False,
        'lookalike_domain_flag': False,
        'recent_small_credit_inflow': False,
        'is_unlinked_collect_req': False,
        'escalating_transfer_ladder': False,
        'high_fan_in_out_velocity': False,
        'dormant_account_flag': False
    }
    
    for col, default_val in new_cols.items():
        if col not in df_transactions.columns:
            df_transactions[col] = default_val

    # Select random indices to become fraud
    n_transactions = len(df_transactions)
    n_fraud = int(n_transactions * fraud_rate)
    
    # Reset existing scam flags if applying over a clean dataset
    df_transactions['scam_type'] = 'None'
    df_transactions['fraud_score'] = np.random.randint(0, 40, size=n_transactions)
    
    if n_fraud > 0:
        fraud_indices = np.random.choice(df_transactions.index, n_fraud, replace=False)
        
        # Give high fraud scores to the selected indices
        df_transactions.loc[fraud_indices, 'fraud_score'] = np.random.randint(85, 100, size=n_fraud)
        
        # Split the fraud indices roughly equally among the 6 archetypes
        splits = np.array_split(fraud_indices, 6)
        
        masks = []
        for split_idx in splits:
            mask = pd.Series(False, index=df_transactions.index)
            mask.loc[split_idx] = True
            masks.append(mask)
            
        df_transactions = _inject_impersonation(df_transactions, df_customers, masks[0])
        df_transactions = _inject_phishing(df_transactions, df_customers, masks[1])
        df_transactions = _inject_fake_refund(df_transactions, df_customers, masks[2])
        df_transactions = _inject_investment(df_transactions, df_customers, masks[3])
        df_transactions = _inject_mule_account(df_transactions, df_customers, masks[4])
        df_transactions = _inject_payment_request(df_transactions, df_customers, masks[5])

    return df_transactions
