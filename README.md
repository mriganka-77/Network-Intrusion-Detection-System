# AI-NIDS: Explainable ML-Based Network Intrusion Detection System

[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end Network Intrusion Detection System (NIDS) that classifies network flows (Normal, DoS/DDoS, Brute Force, Port Scan, Botnet) using high-performance machine learning models and delivers per-prediction explainability via SHAP (SHapley Additive exPlanations) through an interactive SOC analyst dashboard.

---

## 📌 Key Capabilities

- **Multi-Class Threat Classification:** Identifies Benign traffic, DoS, DDoS, Port Scans, Brute Force, and Botnet attacks on CIC-IDS2017 flow data.
- **Explainable AI (XAI) via SHAP:** Breaks down every alert into top contributing flow features (e.g., packet rate anomalies, duration spikes, entropy) mapped to human-readable explanations.
- **Simulated Traffic Replay Engine:** Streams network flows from pre-recorded datasets/pcaps to validate detection and alert generation in real-time.
- **Threat Engine & Persistence:** Evaluates confidence thresholds, assigns severity, deduplicates noisy alerts, and logs flows to SQLite/PostgreSQL.
- **FastAPI REST API:** Exposes endpoints for real-time telemetry, historical stats, threat distribution, and simulation controls.
- **Modern Security Dashboard:** Real-time SOC interface built with React, Tailwind CSS, and Recharts with alert drilldowns and SHAP waterfall visualizations.

---

## 🏗️ Architecture

```
                 ┌───────────────────────┐
                 │   Traffic Source      │
                 │ (Dataset replay /     │
                 │  pcap / live capture) │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ Preprocessing & Scaler│
                 │ (Frozen Feature Schema│
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ ML Inference Service  │
                 │ (RandomForest/XGBoost)│
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ Explainability (SHAP) │
                 │ (Top-K TreeExplainer) │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │    Threat Engine      │
                 │(Severity & Confidence)│
                 └──────────┬────────────┘
                            ▼
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌───────────────┐                    ┌────────────────────┐
│  Flows Log    │                    │   Alerts Store     │
│ (SQLite / DB) │                    │  (Flagged + SHAP)  │
└───────┬───────┘                    └──────────┬─────────┘
        └───────────────────┬───────────────────┘
                            ▼
                 ┌───────────────────────┐
                 │   FastAPI Backend     │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ React / Tailwind UI   │
                 └───────────────────────┘
```

---

## 📂 Repository Layout

```
AI-NIDS/
├── backend/
│   ├── api/                 # FastAPI routes (stats, alerts, simulate)
│   ├── inference/           # Model loading & inference wrapper
│   ├── explainability/      # SHAP explainer & human-readable label mapper
│   ├── threat_engine/       # Severity grading & alert deduplication
│   └── db/                  # SQLAlchemy models & database sessions
├── ml/
│   ├── preprocessing/       # Cleaning, scaling, feature schema contract
│   ├── training/            # Model training pipelines (RF, XGBoost)
│   ├── models/              # Serialized model artifacts (.joblib)
│   └── evaluation/          # Confusion matrices, ROC-AUC, FPR reports
├── network/
│   ├── packet_capture/      # Scapy/live capture (stretch goal)
│   └── replay_simulator/    # Dataset row-by-row streaming engine
├── frontend/                # React + Tailwind SOC analyst dashboard
├── notebooks/               # Exploratory data analysis & experiments
├── reports/                 # Generated performance charts & evaluation summaries
├── archive/                 # Raw CIC-IDS2017 Parquet datasets (ignored in git)
├── PRD.md                   # Product Requirements Document
├── architecture.md          # Detailed architectural specification
├── design.md                # Data schemas & UX design specifications
├── phases.md                # Phased development roadmap
├── requirements.txt         # Python dependencies
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ and npm

### 2. Environment Setup
```bash
# Clone repository
git clone https://github.com/mriganka-77/Network-Intrusion-Detection-System.git
cd Network-Intrusion-Detection-System

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🛣️ Development Phases

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Repository scaffolding, virtual env, requirements | 🔄 In Progress |
| **Phase 1** | Data ingestion, preprocessing, ML model training & evaluation | ⏳ Planned |
| **Phase 2** | SHAP explainability engine & human-readable rule mapping | ⏳ Planned |
| **Phase 3** | FastAPI backend, SQLite persistence, replay simulation | ⏳ Planned |
| **Phase 4** | React + Tailwind SOC security dashboard | ⏳ Planned |
| **Phase 5** | End-to-end integration, performance polish, and demo | ⏳ Planned |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
