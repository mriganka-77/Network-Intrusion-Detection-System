# Architecture — AI-NIDS

## 1. High-Level Architecture

```
                 ┌───────────────────────┐
                 │   Traffic Source      │
                 │ (Dataset replay /     │
                 │  pcap / live capture) │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ Feature Extraction    │
                 │ (dataset columns OR   │
                 │  CICFlowMeter/Scapy)  │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ Preprocessing         │
                 │ (scaling, encoding,   │
                 │  feature alignment)   │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ ML Inference Service  │
                 │ (loads trained model) │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ Explainability (SHAP) │
                 └──────────┬────────────┘
                            ▼
                 ┌───────────────────────┐
                 │ Threat Engine         │
                 │ (label + confidence + │
                 │  top features → alert)│
                 └──────────┬────────────┘
                            ▼
        ┌───────────────────┴───────────────────┐
        ▼                                        ▼
┌───────────────┐                     ┌────────────────────┐
│  Traffic Log   │                     │   Alert Store       │
│ (DB, all flows)│                     │ (DB, flagged only)  │
└───────┬────────┘                     └──────────┬──────────┘
        └───────────────────┬───────────────────────┘
                             ▼
                  ┌───────────────────────┐
                  │   Backend API         │
                  │ (FastAPI/Flask)       │
                  └──────────┬────────────┘
                             ▼
                  ┌───────────────────────┐
                  │  Dashboard (React)    │
                  └───────────────────────┘
```

## 2. Components

### 2.1 Data / Training Pipeline (offline, batch)
- **Input**: CIC-IDS2017 CSVs (or similar).
- **Responsibilities**: cleaning, encoding categorical fields, handling class imbalance (SMOTE or class weights), train/test split, model training, hyperparameter tuning, evaluation, model serialization (`.pkl`/`.joblib`).
- **Output**: versioned model artifact + evaluation report (metrics, confusion matrix, ROC curves).

### 2.2 Feature Extraction Layer
- **Dataset mode**: reads pre-computed flow features directly from CSV (fast path, used for MVP).
- **Replay mode**: reads a pcap or dataset row-by-row on a timer to *simulate* live traffic feeding the same pipeline the live path would use.
- **Live mode (stretch)**: Scapy/CICFlowMeter captures live packets and computes matching flow features in real time.
- All three modes must output features in the **exact schema** the model was trained on — this schema is the contract between extraction and inference.

### 2.3 Inference Service
- Loads the trained model once at startup.
- Exposes an internal function/endpoint: `predict(features) -> {label, confidence, raw_probabilities}`.
- Stateless — safe to scale horizontally later if needed.

### 2.4 Explainability Module
- Wraps the model with a SHAP explainer (TreeExplainer for RF/XGBoost).
- For each prediction, returns top-N features by SHAP value magnitude, with human-readable names.

### 2.5 Threat Engine
- Combines label + confidence + SHAP output into an "alert object."
- Applies simple business rules (e.g., only surface alerts above a confidence threshold, dedupe repeated alerts from same source IP within a time window).

### 2.6 Persistence Layer
- **Traffic log table**: every processed flow, label, timestamp (for volume stats).
- **Alerts table**: only flagged/malicious flows, with explanation payload.
- PostgreSQL or MySQL; SQLite is fine for local dev/demo.

### 2.7 Backend API
- REST endpoints:
  - `GET /stats/overview` — traffic volume, attack counts, active threats.
  - `GET /alerts/recent` — paginated recent alerts.
  - `GET /alerts/{id}` — full detail incl. SHAP explanation.
  - `POST /simulate/start` / `POST /simulate/stop` — control replay mode.
  - `GET /health` — service health.
- Framework: FastAPI (preferred for auto-docs + async) or Flask.

### 2.8 Dashboard (Frontend)
- React + Tailwind + Recharts.
- Views: overview cards (traffic/attacks/active threats), attack-distribution chart, live alert feed, alert detail drawer with SHAP explanation.
- Polls backend API (or WebSocket in a later phase) for near-real-time updates.

## 3. Tech Stack Summary
| Layer | Choice |
|---|---|
| ML | scikit-learn, XGBoost, SHAP |
| Backend | Python, FastAPI, Pandas, NumPy |
| Network capture (stretch) | Scapy, CICFlowMeter |
| Database | PostgreSQL (prod-like) / SQLite (dev) |
| Frontend | React, Tailwind CSS, Recharts |
| Dataset | CIC-IDS2017 |

## 4. Repository Structure
```
AI-NIDS/
├── backend/
│   ├── api/                # FastAPI routes
│   ├── inference/           # model loading + prediction
│   ├── explainability/      # SHAP wrapper
│   ├── threat_engine/
│   └── db/
├── ml/
│   ├── preprocessing/
│   ├── training/
│   ├── models/               # saved artifacts
│   └── evaluation/
├── network/
│   ├── packet_capture/       # Scapy/CICFlowMeter (stretch)
│   └── replay_simulator/     # dataset/pcap replay
├── frontend/
│   └── src/
├── datasets/
├── notebooks/                # EDA, experiments
├── reports/                  # evaluation reports, figures
├── README.md
└── requirements.txt
```

## 5. Key Design Decisions
- **Feature schema is the single source of truth.** Every traffic source (dataset, replay, live) must conform to it; this avoids silent train/serve skew.
- **Replay-first, live-second.** De-risks the project by decoupling "does the ML+dashboard pipeline work" from "does live packet capture work."
- **Model-agnostic inference interface.** Swapping RF for XGBoost should require no changes outside `ml/models/`.
- **Explainability is first-class**, not bolted on — SHAP output is part of the alert schema from day one.

## 6. Key Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Live feature extraction doesn't match training features | Freeze feature schema early; treat live capture as isolated, optional module behind the same interface |
| Class imbalance skews model | Use stratified sampling, class weights, and report per-class metrics, not just overall accuracy |
| Scope too large for timeline | Follow phased plan (phases.md); P0 features only for MVP |
| SHAP too slow for real-time-feeling demo | Precompute/cache explainer; use TreeExplainer (fast for tree models); limit to top-N features |
