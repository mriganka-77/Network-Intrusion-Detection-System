# Design — AI-NIDS

## 1. Purpose
This document covers UX/UI design and data/API design details that sit below the architecture doc — how data is shaped, how the dashboard looks and behaves, and how alerts are structured.

## 2. Data Model

### 2.1 `flows` table (traffic log)
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| timestamp | datetime | when the flow was processed |
| src_ip | string | |
| dst_ip | string | |
| src_port | int | |
| dst_port | int | |
| protocol | string | TCP/UDP/ICMP |
| duration_ms | float | |
| bytes_total | int | |
| label | enum | Normal, DoS, BruteForce, PortScan, Botnet, Other |
| confidence | float | model probability for predicted label |

### 2.2 `alerts` table
| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| flow_id | FK → flows.id | |
| severity | enum | Low, Medium, High |
| top_features | JSON | `[{feature, shap_value, human_label}]` |
| status | enum | New, Acknowledged, Dismissed |
| created_at | datetime | |

### 2.3 Alert Object (API shape)
```json
{
  "id": "uuid",
  "timestamp": "2026-09-19T10:22:31Z",
  "src_ip": "192.168.1.14",
  "attack_type": "Port Scan",
  "confidence": 0.947,
  "severity": "High",
  "top_features": [
    {"feature": "packet_rate", "impact": 0.31, "label": "Unusually high packet rate"},
    {"feature": "dst_port_entropy", "impact": 0.24, "label": "Abnormal destination-port distribution"},
    {"feature": "flow_duration", "impact": 0.18, "label": "High flow duration"}
  ]
}
```

## 3. API Design

| Endpoint | Method | Description |
|---|---|---|
| `/stats/overview` | GET | Returns total traffic volume, attack count, active-threat count for a time window |
| `/stats/distribution` | GET | Attack-type breakdown for chart |
| `/alerts/recent` | GET | Paginated list of recent alerts (query params: limit, offset, severity) |
| `/alerts/{id}` | GET | Full alert detail incl. SHAP explanation |
| `/alerts/{id}/status` | PATCH | Update status (Acknowledged/Dismissed) |
| `/simulate/start` | POST | Begin replaying dataset/pcap as simulated traffic |
| `/simulate/stop` | POST | Stop replay |
| `/health` | GET | Service liveness check |

## 4. Dashboard UX

### 4.1 Layout
```
┌─────────────────────────────────────────────────────────┐
│  AI-NIDS   Network Security Dashboard          [●Live]   │
├───────────────┬───────────────┬─────────────────────────┤
│ Traffic       │ Attacks       │ Active Threats           │
│ 12.4 GB       │ 247           │ 13                       │
├───────────────┴───────────────┴─────────────────────────┤
│  Attack Distribution (bar chart)                         │
│  DoS ████████████                                        │
│  Port Scan ██████                                        │
│  Brute Force ███                                         │
├───────────────────────────────────────────────────────────┤
│  Recent Alerts                                            │
│  🚨 192.168.1.14 → Port Scan   94.7%   [View]             │
│  🚨 10.0.0.5 → DoS             88.2%   [View]             │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Alert Detail (drawer/modal on "View")
- Header: attack type, confidence, severity, timestamp, src/dst IP.
- "Why flagged" section: bar chart of top contributing features (from SHAP), each with a plain-English label (not raw feature names alone).
- Actions: Acknowledge / Dismiss.

### 4.3 States to design for
- Empty state (no traffic processed yet / simulate not started).
- Loading/streaming state (simulate running, data trickling in).
- High-alert-volume state (list needs pagination/virtualization beyond ~50 items).
- No-attacks state (all traffic normal — dashboard should look "calm," not broken).

### 4.4 Visual/Interaction Notes
- Color-code severity: Low = amber, Medium = orange, High = red; Normal traffic in neutral/green tones — avoid overusing red so real alerts stand out.
- Live feed should visually indicate new items (e.g., brief highlight on insert) without being distracting.
- Confidence shown both as % and as a simple bar, so it's scannable at a glance.

## 5. Explainability Presentation
- Never show raw feature names alone (e.g., `flow_iat_mean`) — map to human-readable labels via a lookup table maintained in `explainability/feature_labels.py`.
- Show at most top 3–5 features per alert to avoid overwhelming the user.
- Include a short one-line plain-English summary above the feature breakdown, e.g., "Flagged mainly due to abnormally high packet rate and repeated port access."

## 6. Model Evaluation Report Design
For each model compared (RF, XGBoost, etc.), the report (Jupyter notebook or generated HTML/PDF) should include:
- Confusion matrix (per class).
- Precision/recall/F1 per class + macro-average.
- ROC-AUC (one-vs-rest for multiclass).
- False-positive rate on Normal-vs-Attack binary framing (important for real-world usefulness).
- Feature importance plot (global SHAP summary plot).
