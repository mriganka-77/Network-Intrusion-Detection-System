"""
Integration tests for AI-NIDS FastAPI backend, ML inference, and threat engine.
"""

import pytest
from fastapi.testclient import TestClient
import pandas as pd
import os

from backend.main import app
from backend.db.session import init_db
from ml.models import __file__ as models_init

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_stats_overview_empty():
    response = client.get("/stats/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_flows" in data
    assert "total_attacks" in data
    assert "active_threats" in data


def test_predict_and_explain():
    sample_file = os.path.join(os.path.dirname(__file__), "..", "ml", "models", "test_sample.parquet")
    df = pd.read_parquet(sample_file)
    sample_row = df.iloc[0].to_dict()

    response = client.post("/predict", json=sample_row)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert "confidence" in data
    assert "summary" in data
    assert "top_features" in data
    assert len(data["top_features"]) <= 5
    assert "title" in data["top_features"][0]
    assert "impact" in data["top_features"][0]


def test_simulation_lifecycle():
    # Start
    start_resp = client.post("/simulate/start", json={"rate_hz": 5.0})
    assert start_resp.status_code == 200

    # Check status
    status_resp = client.get("/simulate/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "is_running" in status_data

    # Stop
    stop_resp = client.post("/simulate/stop")
    assert stop_resp.status_code == 200
    assert stop_resp.json()["status"] == "stopped"
