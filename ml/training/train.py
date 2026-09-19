"""
Model training pipeline for AI-NIDS.
Trains Random Forest and XGBoost directly from archive/ dataset,
evaluates both on the test split, selects the champion model, and serializes artifacts.
"""

import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, f1_score, accuracy_score
import xgboost as xgb

from ml.preprocessing.data_loader import load_data_from_archive, load_feature_schema
from ml.preprocessing.label_mapping import CANONICAL_CLASSES, CLASS_TO_ID, ID_TO_CLASS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def train_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    schema = load_feature_schema()
    feature_names = schema["features"]

    print("=" * 65)
    print("AI-NIDS: Starting Offline ML Training Pipeline")
    print("=" * 65)

    # 1. Load data directly from archive/
    X_train, X_test, y_train, y_test, _ = load_data_from_archive(
        benign_sample_size=100000,
        dos_sample_size=80000,
        test_size=0.20,
        random_state=42
    )

    results = {}

    # 2. Train Random Forest Baseline
    print("-" * 65)
    print("Training Model 1: Random Forest Classifier (n_estimators=100, max_depth=20)...")
    t0 = time.time()
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        n_jobs=-1,
        class_weight="balanced",
        random_state=42
    )
    rf.fit(X_train, y_train)
    rf_train_time = time.time() - t0
    print(f"Random Forest training finished in {rf_train_time:.2f}s")

    # Evaluate RF
    rf_preds = rf.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_macro_f1 = f1_score(y_test, rf_preds, average="macro")
    rf_weighted_f1 = f1_score(y_test, rf_preds, average="weighted")
    print(f"  RF Test Accuracy:    {rf_acc * 100:.2f}%")
    print(f"  RF Macro F1-Score:   {rf_macro_f1:.4f}")
    print(f"  RF Weighted F1-Score:{rf_weighted_f1:.4f}")
    results["RandomForest"] = {
        "model": rf,
        "accuracy": float(rf_acc),
        "macro_f1": float(rf_macro_f1),
        "weighted_f1": float(rf_weighted_f1),
        "train_time_sec": float(rf_train_time)
    }

    # 3. Train XGBoost Baseline
    print("-" * 65)
    print("Training Model 2: XGBoost Classifier (hist method, max_depth=8, lr=0.1)...")
    t0 = time.time()
    xgb_clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=8,
        learning_rate=0.1,
        objective="multi:softprob",
        tree_method="hist",
        n_jobs=-1,
        random_state=42
    )
    xgb_clf.fit(X_train, y_train)
    xgb_train_time = time.time() - t0
    print(f"XGBoost training finished in {xgb_train_time:.2f}s")

    # Evaluate XGBoost
    xgb_preds = xgb_clf.predict(X_test)
    xgb_acc = accuracy_score(y_test, xgb_preds)
    xgb_macro_f1 = f1_score(y_test, xgb_preds, average="macro")
    xgb_weighted_f1 = f1_score(y_test, xgb_preds, average="weighted")
    print(f"  XGB Test Accuracy:    {xgb_acc * 100:.2f}%")
    print(f"  XGB Macro F1-Score:   {xgb_macro_f1:.4f}")
    print(f"  XGB Weighted F1-Score:{xgb_weighted_f1:.4f}")
    results["XGBoost"] = {
        "model": xgb_clf,
        "accuracy": float(xgb_acc),
        "macro_f1": float(xgb_macro_f1),
        "weighted_f1": float(xgb_weighted_f1),
        "train_time_sec": float(xgb_train_time)
    }

    # 4. Determine Champion Model
    champion_name = "XGBoost" if results["XGBoost"]["macro_f1"] >= results["RandomForest"]["macro_f1"] else "RandomForest"
    champion = results[champion_name]["model"]
    print("-" * 65)
    print(f"🏆 Champion Model Selected: {champion_name} (Macro F1: {results[champion_name]['macro_f1']:.4f})")

    # 5. Serialize Artifacts
    best_model_path = os.path.join(MODELS_DIR, "best_model.joblib")
    rf_path = os.path.join(MODELS_DIR, "rf_model.joblib")
    xgb_path = os.path.join(MODELS_DIR, "xgb_model.joblib")
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")

    print(f"Saving artifacts to {MODELS_DIR}...")
    joblib.dump(champion, best_model_path)
    joblib.dump(rf, rf_path)
    joblib.dump(xgb_clf, xgb_path)

    metadata = {
        "champion": champion_name,
        "classes": CANONICAL_CLASSES,
        "class_to_id": CLASS_TO_ID,
        "id_to_class": {str(k): v for k, v in ID_TO_CLASS.items()},
        "num_features": len(feature_names),
        "feature_names": feature_names,
        "models": {
            "RandomForest": {
                "accuracy": results["RandomForest"]["accuracy"],
                "macro_f1": results["RandomForest"]["macro_f1"],
                "weighted_f1": results["RandomForest"]["weighted_f1"],
                "train_time_sec": results["RandomForest"]["train_time_sec"]
            },
            "XGBoost": {
                "accuracy": results["XGBoost"]["accuracy"],
                "macro_f1": results["XGBoost"]["macro_f1"],
                "weighted_f1": results["XGBoost"]["weighted_f1"],
                "train_time_sec": results["XGBoost"]["train_time_sec"]
            }
        },
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # Save a high-fidelity test sample (flows across all classes) for replay and fast testing
    test_sample_df = X_test.copy()
    test_sample_df["target"] = y_test.values
    sample_chunks = []
    for target_val, group in test_sample_df.groupby("target"):
        sample_chunks.append(group.sample(min(len(group), 1000), random_state=42))
    sample_per_class = pd.concat(sample_chunks, ignore_index=True)
    test_sample_path = os.path.join(MODELS_DIR, "test_sample.parquet")
    sample_per_class.to_parquet(test_sample_path, index=False)
    print(f"Saved test evaluation sample ({len(sample_per_class):,} flows) to {test_sample_path}")

    print(f"Successfully saved all models & metadata!")
    print("=" * 65)

    return results


if __name__ == "__main__":
    train_models()
