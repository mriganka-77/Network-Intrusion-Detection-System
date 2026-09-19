# PRD — AI-NIDS: Explainable ML-Based Network Intrusion Detection System

## 1. Overview
AI-NIDS is a system that ingests network traffic (dataset-based, with a path to live capture), classifies each connection/flow as normal or a specific attack type, and presents results through a dashboard with human-readable explanations of *why* a flow was flagged.

## 2. Problem Statement
Traditional signature-based intrusion detection systems (IDS) struggle to catch novel or evolving attack patterns and rarely explain their decisions, making it hard for analysts to trust or act on alerts. This project builds a machine-learning-based IDS that improves detection of common attack classes and adds explainability so predictions are actionable, not just alarms.

## 3. Goals
- Classify network flows into: Normal, DoS/DDoS, Brute Force, Port Scan, Botnet, Other.
- Compare multiple ML models on standard benchmarks (accuracy, precision, recall, F1, ROC-AUC, FPR).
- Provide per-prediction explainability (SHAP) — top contributing features per alert.
- Present results in a live-updating security dashboard.
- Ship a working, demoable end-to-end pipeline, not just a notebook.

## 4. Non-Goals (v1)
- Not a production-grade enterprise IDS (no HA, no multi-sensor deployment).
- Not guaranteed to catch zero-day/novel attacks outside training distribution.
- Live packet capture is a stretch goal, not a v1 requirement — v1 uses dataset replay as "simulated live traffic."
- No automated blocking/response (detection only, not prevention).

## 5. Target Users
- Primary: You (as a portfolio/resume project, academic submission, or demo in interviews).
- Secondary persona for design purposes: a SOC analyst who needs quick, explainable alerts.

## 6. Core Features (MVP)
| # | Feature | Priority |
|---|---|---|
| 1 | Offline training pipeline on CIC-IDS2017 | P0 |
| 2 | Multi-model comparison (RF, XGBoost minimum) | P0 |
| 3 | Evaluation report (metrics + confusion matrix) | P0 |
| 4 | REST API serving predictions from trained model | P0 |
| 5 | SHAP-based explainability per prediction | P0 |
| 6 | Dashboard: traffic volume, attack counts, alert feed | P0 |
| 7 | "Simulated live" traffic replay from dataset/pcap | P1 |
| 8 | Live packet capture via Scapy/CICFlowMeter | P2 (stretch) |
| 9 | Additional models (SVM, kNN, NN) for comparison | P2 |
| 10 | Alerting (email/webhook) | P2 |

## 7. Success Metrics
- Model: F1-score ≥ 0.90 on majority attack classes; false-positive rate reported and minimized.
- System: end-to-end flow from raw data → prediction → dashboard alert works without manual steps.
- Explainability: every alert shows at least top-3 contributing features.
- Demo: can run a 5-minute live demo showing traffic → detection → dashboard update.

## 8. Constraints & Assumptions
- Development machine only (no dedicated network sensor hardware assumed).
- CIC-IDS2017 (or similar) used for training; real live traffic used only for demo/testing, not training.
- Single-user local deployment; no auth/multi-tenancy required for v1.

## 9. Risks
- Feature mismatch between dataset-derived features and live-captured flow features (see Architecture doc, Risk section).
- Class imbalance in dataset (Normal >> some attack types) may skew metrics — needs resampling/weighting.
- Scope creep: real-time capture + XAI + dashboard is a lot for one person — phased delivery is mandatory (see phases.md).

## 10. Deliverables
- GitHub repo with structured codebase (see architecture.md for structure).
- Trained model(s) + evaluation report.
- Working dashboard (screen recording if live demo isn't feasible).
- README with setup instructions and documented limitations.
