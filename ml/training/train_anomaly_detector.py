"""
SentinelIQ - Unsupervised Behavioral Anomaly Detection Pipeline
Trains Isolation Forest and PyTorch Autoencoders to model customer behavioral
baselines and flag zero-day or non-conforming transaction outliers.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset


class TransactionAutoencoder(nn.Module):
    """Deep Autoencoder for customer transaction reconstruction error scoring."""
    def __init__(self, input_dim: int = 8, latent_dim: int = 4):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.BatchNorm1d(16),
            nn.ReLU(),
            nn.Linear(16, latent_dim),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 16),
            nn.BatchNorm1d(16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def train_isolation_forest(output_dir: str = MODELS_DIR):
    """Trains and exports baseline Isolation Forest."""
    print("Training Isolation Forest Anomaly Detector...")
    np.random.seed(42)
    # Generate baseline normal behaviors
    n_samples = 3000
    X_normal = np.random.normal(loc=0.0, scale=1.0, size=(n_samples, 8))

    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.015,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_normal)

    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "isolation_forest_v1.joblib")
    joblib.dump(iso_forest, model_path)
    print(f"Isolation Forest saved to: {model_path}")
    return iso_forest


def train_autoencoder(output_dir: str = MODELS_DIR, epochs: int = 10):
    """Trains and exports PyTorch Autoencoder."""
    print(f"Training PyTorch Autoencoder ({epochs} epochs)...")
    np.random.seed(42)
    X_normal = np.random.normal(loc=0.0, scale=1.0, size=(3000, 8)).astype(np.float32)
    tensor_data = TensorDataset(torch.from_numpy(X_normal))
    loader = DataLoader(tensor_data, batch_size=64, shuffle=True)

    model = TransactionAutoencoder(input_dim=8, latent_dim=4)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005)

    model.train()
    for epoch in range(epochs):
        total_loss = 0.0
        for (batch,) in loader:
            optimizer.zero_grad()
            outputs = model(batch)
            loss = criterion(outputs, batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch+1}/{epochs}] Loss: {total_loss / len(loader):.5f}")

    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "autoencoder_v1.pt")
    torch.save(model.state_dict(), model_path)
    print(f"Autoencoder model saved to: {model_path}")
    return model


if __name__ == "__main__":
    train_isolation_forest()
    train_autoencoder()
