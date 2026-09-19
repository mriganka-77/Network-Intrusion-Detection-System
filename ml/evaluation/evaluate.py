"""
Evaluation module for AI-NIDS.
Computes multi-class metrics, binary false positive rate (FPR),
and generates confusion matrix & ROC curve visual artifacts in reports/.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    roc_auc_score
)
from sklearn.preprocessing import label_binarize

from ml.preprocessing.data_loader import load_feature_schema
from ml.preprocessing.label_mapping import CANONICAL_CLASSES, CLASS_TO_ID, ID_TO_CLASS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")


def evaluate_model(test_sample_path: str = None):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    schema = load_feature_schema()
    feature_names = schema["features"]

    # 1. Load Model & Metadata
    model_path = os.path.join(MODELS_DIR, "best_model.joblib")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Run train.py first.")

    model = joblib.load(model_path)
    with open(meta_path, "r") as f:
        metadata = json.load(f)

    champion_name = metadata.get("champion", "Model")
    print(f"Loaded champion model: {champion_name}")

    # 2. Load Evaluation Data
    if test_sample_path is None:
        test_sample_path = os.path.join(MODELS_DIR, "test_sample.parquet")
    
    test_df = pd.read_parquet(test_sample_path)
    X_test = test_df[feature_names]
    y_test = test_df["target"]
    print(f"Evaluating on {len(test_df):,} test flows...")

    # 3. Predictions & Probabilities
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)

    # 4. Detailed Classification Report
    target_names = [ID_TO_CLASS[i] for i in range(len(CANONICAL_CLASSES))]
    report_dict = classification_report(
        y_test, y_pred,
        target_names=target_names,
        output_dict=True,
        zero_division=0
    )
    print("\n" + "=" * 65)
    print(f"EVALUATION REPORT — {champion_name}")
    print("=" * 65)
    print(classification_report(y_test, y_pred, target_names=target_names, zero_division=0))

    # 5. Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(9, 7))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=target_names,
        yticklabels=target_names
    )
    plt.title(f"Confusion Matrix — AI-NIDS ({champion_name})", fontsize=14, fontweight="bold", pad=12)
    plt.xlabel("Predicted Class", fontsize=11)
    plt.ylabel("Ground Truth Class", fontsize=11)
    plt.tight_layout()
    cm_plot_path = os.path.join(REPORTS_DIR, "confusion_matrix.png")
    plt.savefig(cm_plot_path, dpi=200)
    plt.close()
    print(f"Saved confusion matrix plot: {cm_plot_path}")

    # 6. Binary False Positive Rate (FPR) on Normal Traffic
    # Class 0 is 'Normal'
    normal_id = CLASS_TO_ID["Normal"]
    normal_mask = (y_test == normal_id)
    fp = np.sum((y_pred != normal_id) & normal_mask)
    tn = np.sum((y_pred == normal_id) & normal_mask)
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    print(f"\nOperational Metric: Normal Traffic False Positive Rate (FPR): {fpr * 100:.3f}% ({fp}/{fp+tn} normal flows falsely flagged)")

    # 7. Multi-class ROC Curves & AUC
    y_test_bin = label_binarize(y_test, classes=list(range(len(CANONICAL_CLASSES))))
    plt.figure(figsize=(9, 7))
    auc_scores = {}

    for i, cls_name in enumerate(target_names):
        if len(np.unique(y_test_bin[:, i])) > 1:
            fpr_cls, tpr_cls, _ = roc_curve(y_test_bin[:, i], y_prob[:, i])
            roc_auc = auc(fpr_cls, tpr_cls)
            auc_scores[cls_name] = float(roc_auc)
            plt.plot(fpr_cls, tpr_cls, lw=2, label=f"{cls_name} (AUC = {roc_auc:.3f})")

    plt.plot([0, 1], [0, 1], color="gray", linestyle="--")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate", fontsize=11)
    plt.ylabel("True Positive Rate", fontsize=11)
    plt.title(f"Multi-Class ROC Curves — AI-NIDS ({champion_name})", fontsize=14, fontweight="bold", pad=12)
    plt.legend(loc="lower right", fontsize=10)
    plt.tight_layout()
    roc_plot_path = os.path.join(REPORTS_DIR, "roc_curves.png")
    plt.savefig(roc_plot_path, dpi=200)
    plt.close()
    print(f"Saved ROC curves plot: {roc_plot_path}")

    # 8. Save Metrics Summary JSON
    metrics_summary = {
        "model": champion_name,
        "test_samples": len(y_test),
        "false_positive_rate_pct": float(fpr * 100),
        "classification_report": report_dict,
        "roc_auc_scores": auc_scores,
        "plots": {
            "confusion_matrix": "reports/confusion_matrix.png",
            "roc_curves": "reports/roc_curves.png"
        }
    }
    summary_path = os.path.join(REPORTS_DIR, "evaluation_metrics.json")
    with open(summary_path, "w") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"Saved metrics summary: {summary_path}")
    print("=" * 65)


if __name__ == "__main__":
    evaluate_model()
