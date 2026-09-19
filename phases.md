# Phases — AI-NIDS

Guiding principle: get a thin, working end-to-end pipeline early (even with fake/simple pieces), then deepen each layer. Don't build any one layer to perfection before the others exist — you want something demoable at the end of every phase.

## Phase 0 — Setup (0.5–1 week)
- Set up repo structure (see architecture.md).
- Set up Python env, install scikit-learn, XGBoost, SHAP, pandas, FastAPI.
- Download and inspect CIC-IDS2017; understand its columns and label distribution.
- **Exit criteria**: dataset loads cleanly into a notebook; you understand the label classes and feature columns.

## Phase 1 — Offline ML Core (1–2 weeks)
- Preprocess data: handle missing/infinite values, encode labels, scale features, address class imbalance.
- Train Random Forest and XGBoost baseline models.
- Evaluate with accuracy, precision, recall, F1, ROC-AUC, confusion matrix, FPR (per design.md §6).
- Freeze the **feature schema** — this becomes the contract for every later stage.
- **Exit criteria**: a saved model artifact + an evaluation report showing metrics per class.

## Phase 2 — Explainability (0.5–1 week)
- Add SHAP TreeExplainer over the best model.
- Build a feature-name → human-readable-label mapping for the top features you expect to matter.
- Validate: pick 3–5 sample predictions and manually sanity-check that the SHAP explanations make sense.
- **Exit criteria**: given a feature row, you can output `{label, confidence, top_features}`.

## Phase 3 — Backend API (0.5–1 week)
- Stand up FastAPI service that loads the model + explainer at startup.
- Implement `/simulate/start`, `/simulate/stop` using a **dataset replay** (read rows from the test set on a timer, feed through the pipeline, write to `flows`/`alerts` tables).
- Implement `/stats/overview`, `/stats/distribution`, `/alerts/recent`, `/alerts/{id}`.
- Use SQLite for local dev.
- **Exit criteria**: hitting the API with curl/Postman during a running simulation returns real, evolving data.

## Phase 4 — Dashboard (1–1.5 weeks)
- Build React app per design.md layout: overview cards, attack-distribution chart, live alert feed.
- Build alert detail view showing SHAP explanation.
- Wire up polling against the backend API.
- Handle empty/loading/no-attack states.
- **Exit criteria**: you can start a simulation and watch the dashboard update with real alerts and explanations — this is your MVP demo.

## Phase 5 — Polish & Report (0.5–1 week)
- Write README with setup instructions, architecture summary, and known limitations (esp. that live capture is a stretch goal, not implemented/partial).
- Record a short demo video/gif as a fallback in case live demo isn't practical.
- Clean up notebooks into a coherent `reports/` folder.
- **Exit criteria**: someone unfamiliar with the project could clone the repo, follow the README, and get the demo running.

---

## Stretch Phases (only after MVP is solid)

## Phase 6 — Live Packet Capture (1–2+ weeks, high uncertainty)
- Use Scapy or CICFlowMeter to capture live packets and compute flow features matching the frozen schema.
- Validate feature parity against the offline dataset's feature definitions (this is the hardest part — budget real time for debugging mismatches).
- Swap the "traffic source" in the pipeline from replay to live capture behind the same interface.
- **Exit criteria**: running live capture on your own machine/network produces sane, non-garbage predictions.

## Phase 7 — Extended Model Comparison
- Add SVM, k-NN, Neural Network to the comparison.
- Add a model-comparison view/report (side-by-side metrics).

## Phase 8 — Alerting & Response
- Add email/webhook notifications for High-severity alerts.
- Add basic alert-status workflow (Acknowledge/Dismiss) fully wired into the dashboard.

## Phase 9 — Real-time upgrade
- Replace polling with WebSockets for true real-time dashboard updates.
- Add rate limiting / dedupe logic in the threat engine for repeated alerts from the same source.

---

## Suggested Timeline Summary
| Phase | Duration | Priority |
|---|---|---|
| 0. Setup | 0.5–1 wk | P0 |
| 1. ML Core | 1–2 wk | P0 |
| 2. Explainability | 0.5–1 wk | P0 |
| 3. Backend API | 0.5–1 wk | P0 |
| 4. Dashboard | 1–1.5 wk | P0 |
| 5. Polish & Report | 0.5–1 wk | P0 |
| **MVP Total** | **~4–7 weeks** | |
| 6. Live Capture | 1–2+ wk | P2 |
| 7. Extended Models | 0.5–1 wk | P2 |
| 8. Alerting | 0.5 wk | P2 |
| 9. Real-time upgrade | 0.5–1 wk | P2 |
