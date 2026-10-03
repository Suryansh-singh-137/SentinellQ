import numpy as np
import pandas as pd
import uuid

def generate_loan_trajectories(df_customers: pd.DataFrame, df_transactions: pd.DataFrame) -> dict:
    """
    Generates loan portfolios, monthly trajectories, and early warning financial distress signals.
    Returns a dictionary of DataFrames: 'loans', 'repayments', 'income_expense', 'repayment_risk'
    """
    # 1. Establish Base Loan Holders (~35% of customers)
    np.random.seed(42)
    n_customers = len(df_customers)
    loan_mask = np.random.rand(n_customers) < 0.35 if n_customers > 0 else np.array([], dtype=bool)
    if n_customers > 0 and not loan_mask.any():
        loan_mask[0] = True
    df_borrowers = df_customers[loan_mask].copy() if n_customers > 0 else pd.DataFrame(columns=df_customers.columns)
    n_borrowers = len(df_borrowers)
    
    if n_borrowers == 0:
        empty_cols_loans = ['loan_id', 'customer_id', 'principal', 'interest_rate', 'tenure_months', 'emi', 'outstanding_balance', 'emi_to_income_ratio', 'dpd_bucket', 'late_payment_count', 'income_trend_drop_pct', 'spending_spike_flag', 'debt_stress_flag', 'recent_scam_loss_flag', 'status']
        return {
            'loans': pd.DataFrame(columns=empty_cols_loans),
            'repayments': pd.DataFrame(columns=['customer_id', 'dpd_days', 'dpd_bucket', 'late_payment_count']),
            'income_expense': pd.DataFrame(columns=['customer_id', 'base_monthly_income', 'income_trend_drop_pct', 'current_monthly_income', 'spending_spike_flag']),
            'repayment_risk': pd.DataFrame(columns=['customer_id', 'emi', 'outstanding_balance', 'base_monthly_income', 'income_trend_drop_pct', 'current_monthly_income', 'spending_spike_flag', 'total_scam_loss', 'recent_scam_loss_flag', 'net_cash_flow', 'cash_runway_months', 'emi_to_income_ratio', 'debt_stress_flag', 'late_payment_count', 'dpd_days', 'dpd_bucket', 'credit_utilization_pct', 'repayment_score', 'stage'])
        }

    # Initialize Loans DataFrame
    df_loans = pd.DataFrame({
        'loan_id': [str(uuid.uuid4()) for _ in range(n_borrowers)],
        'customer_id': df_borrowers['customer_id'].values,
        'principal': np.random.uniform(50000, 2000000, size=n_borrowers).round(2),
        'interest_rate': np.random.uniform(8.5, 24.0, size=n_borrowers).round(2),
        'tenure_months': np.random.choice([12, 24, 36, 48, 60], size=n_borrowers),
    })
    
    # Calculate EMI using standard formula: P * r * (1+r)^n / ((1+r)^n - 1)
    r_monthly = (df_loans['interest_rate'] / 100) / 12
    n = df_loans['tenure_months']
    df_loans['emi'] = (df_loans['principal'] * r_monthly * (1 + r_monthly)**n / ((1 + r_monthly)**n - 1)).round(2)
    
    # Randomize current outstanding balance based on how far along they are
    progress = np.random.uniform(0.1, 0.9, size=n_borrowers)
    df_loans['outstanding_balance'] = (df_loans['principal'] * (1 - progress)).round(2)

    # 2. Income & Expense Trajectories
    # Base income comes from customer profile. Let's introduce shocks and trends.
    df_inc_exp = pd.DataFrame({
        'customer_id': df_borrowers['customer_id'].values,
        'base_monthly_income': df_borrowers['monthly_income'].values,
    })
    
    # Simulate income drops (10% of borrowers experience a >20% income drop)
    income_shock_mask = np.random.rand(n_borrowers) < 0.10
    df_inc_exp['income_trend_drop_pct'] = 0.0
    df_inc_exp.loc[income_shock_mask, 'income_trend_drop_pct'] = np.random.uniform(20.0, 60.0, size=income_shock_mask.sum()).round(2)
    
    df_inc_exp['current_monthly_income'] = (df_inc_exp['base_monthly_income'] * (1 - (df_inc_exp['income_trend_drop_pct']/100))).round(2)
    
    # Spending spikes (rapid expense growth or high cash withdrawals)
    spending_spike_mask = np.random.rand(n_borrowers) < 0.15
    df_inc_exp['spending_spike_flag'] = spending_spike_mask
    
    # 3. Cross-Signal Fraud Link (Identify scam victims from transactions)
    # Filter transactions to find true positives for scams
    scam_tx = df_transactions[(df_transactions['scam_type'] != 'None') & (df_transactions['fraud_score'] >= 70)]
    scam_victims = scam_tx.groupby('customer_id')['amount'].sum().reset_index()
    scam_victims.rename(columns={'amount': 'total_scam_loss'}, inplace=True)
    
    # Merge scam losses into the risk profile
    df_risk = pd.merge(df_loans[['customer_id', 'emi', 'outstanding_balance']], df_inc_exp, on='customer_id', how='left')
    df_risk = pd.merge(df_risk, scam_victims, on='customer_id', how='left')
    
    df_risk['recent_scam_loss_flag'] = df_risk['total_scam_loss'].notna()
    df_risk['total_scam_loss'] = df_risk['total_scam_loss'].fillna(0.0)

    # 4. Cash Flow & Runway Calculation
    # Baseline expenses (assume ~40% of income goes to non-discretionary spending normally)
    base_expenses = df_risk['base_monthly_income'] * np.random.uniform(0.3, 0.5, size=n_borrowers)
    
    # Spike expenses if flag is true
    spike_multiplier = np.where(df_risk['spending_spike_flag'], np.random.uniform(1.5, 2.5, size=n_borrowers), 1.0)
    current_expenses = base_expenses * spike_multiplier
    
    df_risk['net_cash_flow'] = (df_risk['current_monthly_income'] - current_expenses - df_risk['emi']).round(2)
    
    # Subtract scam loss from cash reserves/runway abruptly
    df_risk['net_cash_flow'] = np.where(df_risk['recent_scam_loss_flag'], df_risk['net_cash_flow'] - df_risk['total_scam_loss'], df_risk['net_cash_flow'])
    
    df_risk['cash_runway_months'] = np.where(df_risk['net_cash_flow'] < 0, 
                                             np.random.uniform(0.1, 2.0, size=n_borrowers), # Highly distressed
                                             np.random.uniform(3.0, 12.0, size=n_borrowers)).round(1)

    # 5. DPD Buckets & Repayment History
    df_risk['emi_to_income_ratio'] = (df_risk['emi'] / df_risk['current_monthly_income'].replace(0, 1)).round(2)
    
    # Distressed logical conditions
    is_distressed = (df_risk['emi_to_income_ratio'] > 0.45) | (df_risk['net_cash_flow'] < 0) | df_risk['recent_scam_loss_flag'] | df_risk['spending_spike_flag']
    
    # Late payment count (Rolling 6 months)
    df_risk['late_payment_count'] = 0
    distressed_idx = df_risk[is_distressed].index
    if len(distressed_idx) > 0:
        df_risk.loc[distressed_idx, 'late_payment_count'] = np.random.randint(1, 6, size=len(distressed_idx))
    
    # Assign DPD Buckets based on stress
    dpd_choices_distressed = [0, 15, 30, 45, 60, 90]
    dpd_choices_healthy = [0, 0, 0, 0, 0, 15]
    
    df_risk['dpd_days'] = np.where(is_distressed, 
                                   np.random.choice(dpd_choices_distressed, size=n_borrowers),
                                   np.random.choice(dpd_choices_healthy, size=n_borrowers))
    
    # Create DPD String Buckets
    conditions = [
        (df_risk['dpd_days'] == 0),
        (df_risk['dpd_days'] > 0) & (df_risk['dpd_days'] <= 30),
        (df_risk['dpd_days'] > 30) & (df_risk['dpd_days'] <= 60),
        (df_risk['dpd_days'] > 60)
    ]
    choices = ['0', '1-30', '30-60', '60+']
    df_risk['dpd_bucket'] = np.select(conditions, choices, default='0')
    
    df_risk['credit_utilization_pct'] = np.random.uniform(10.0, 95.0, size=n_borrowers).round(2)
    df_risk.loc[is_distressed, 'credit_utilization_pct'] = np.random.uniform(80.0, 99.0, size=is_distressed.sum()).round(2)
    
    # 6. Final Repayment Score and Stage
    # Calculate Score (100 is excellent, 0 is default)
    # Start at 90
    score = np.full(n_borrowers, 90.0)
    score -= (df_risk['emi_to_income_ratio'] * 40) # High ratio lowers score (e.g., 0.5 ratio drops score by 20)
    score -= (df_risk['late_payment_count'] * 10)
    score -= np.where(df_risk['recent_scam_loss_flag'], 25, 0)
    score -= np.where(df_risk['net_cash_flow'] < 0, 15, 0)
    score -= (df_risk['dpd_days'] * 0.5)
    
    df_risk['repayment_score'] = np.clip(score, 0, 100).round(1)
    
    # Assign Stage
    stage_conds = [
        (df_risk['repayment_score'] >= 75),
        (df_risk['repayment_score'] >= 50) & (df_risk['repayment_score'] < 75),
        (df_risk['repayment_score'] >= 30) & (df_risk['repayment_score'] < 50),
        (df_risk['repayment_score'] < 30)
    ]
    stage_choices = ['Healthy', 'Watch', 'Stressed', 'Default-risk']
    df_risk['stage'] = np.select(stage_conds, stage_choices, default='Healthy')

    # Merge final flags back to df_loans so it has the expected schema if needed by downstream
    df_loans = pd.merge(df_loans, df_risk[['customer_id', 'emi_to_income_ratio', 'dpd_bucket', 
                                           'late_payment_count', 'income_trend_drop_pct', 
                                           'spending_spike_flag', 'recent_scam_loss_flag', 
                                           'stage']], on='customer_id', how='left')
    df_loans.rename(columns={'stage': 'status'}, inplace=True)

    return {
        'loans': df_loans,
        'repayments': df_risk[['customer_id', 'dpd_days', 'dpd_bucket', 'late_payment_count']],
        'income_expense': df_inc_exp,
        'repayment_risk': df_risk
    }
