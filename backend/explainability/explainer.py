"""
SHAP-based explainability module for AI-NIDS.
Provides per-prediction feature attribution and plain-English threat rationale.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List, Union

from ml.preprocessing.data_loader import load_feature_schema
from ml.preprocessing.label_mapping import CANONICAL_CLASSES, ID_TO_CLASS
from backend.explainability.feature_labels import get_feature_meta

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")


class NIDSExplainer:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = os.path.join(MODELS_DIR, "best_model.joblib")
            
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}")

        print(f"Initializing NIDSExplainer with model: {model_path}")
        self.model = joblib.load(model_path)
        
        schema = load_feature_schema()
        self.feature_names = schema["features"]
        self.classes = CANONICAL_CLASSES

        # Initialize TreeExplainer
        print("Constructing SHAP TreeExplainer...")
        self.explainer = shap.TreeExplainer(self.model)
        print("SHAP TreeExplainer ready.")

    def explain(
        self,
        features: Union[pd.DataFrame, pd.Series, dict, np.ndarray],
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Explain a single flow prediction.
        Returns predicted label, confidence, top contributing features, and rationale.
        """
        # Convert to aligned DataFrame
        if isinstance(features, dict):
            df = pd.DataFrame([features])
        elif isinstance(features, pd.Series):
            df = pd.DataFrame([features])
        elif isinstance(features, np.ndarray):
            if features.ndim == 1:
                features = features.reshape(1, -1)
            df = pd.DataFrame(features, columns=self.feature_names)
        elif isinstance(features, pd.DataFrame):
            df = features.copy()
        else:
            raise ValueError(f"Unsupported features format: {type(features)}")

        # Ensure all columns present
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0.0
        X = df[self.feature_names].fillna(0.0)

        # Inference
        probs = self.model.predict_proba(X)[0]
        pred_idx = int(np.argmax(probs))
        pred_class = ID_TO_CLASS[pred_idx]
        confidence = float(probs[pred_idx])

        # SHAP calculation
        shap_values = self.explainer.shap_values(X)

        # Handle different SHAP output formats across versions
        if isinstance(shap_values, list):
            # List of [1, n_features] per class
            class_shap = np.array(shap_values[pred_idx])[0]
        elif isinstance(shap_values, np.ndarray):
            if shap_values.ndim == 3:
                # Shape (1, n_features, n_classes) or (1, n_classes, n_features)
                if shap_values.shape[2] == len(self.classes):
                    class_shap = shap_values[0, :, pred_idx]
                else:
                    class_shap = shap_values[0, pred_idx, :]
            elif shap_values.ndim == 2:
                class_shap = shap_values[0]
            else:
                class_shap = shap_values.flatten()
        else:
            class_shap = np.zeros(len(self.feature_names))

        # Rank features by absolute attribution impact
        top_indices = np.argsort(np.abs(class_shap))[::-1][:top_k]

        contributing_features = []
        top_feature_titles = []

        for rank, idx in enumerate(top_indices, 1):
            feat_name = self.feature_names[idx]
            raw_val = float(X.iloc[0, idx])
            impact = float(class_shap[idx])
            meta = get_feature_meta(feat_name)

            contributing_features.append({
                "rank": rank,
                "feature": feat_name,
                "title": meta["title"],
                "value": round(raw_val, 4),
                "impact": round(impact, 4),
                "label": meta["description"]
            })
            if rank <= 2:
                top_feature_titles.append(meta["title"])

        # Construct Plain-English Rationale Summary
        if pred_class == "Normal":
            summary = f"Normal traffic pattern (confidence {confidence * 100:.1f}%) with expected volume and timing metrics."
        else:
            reasons = " and ".join(top_feature_titles)
            summary = (
                f"Flagged as {pred_class} ({confidence * 100:.1f}% confidence) "
                f"driven primarily by {reasons}."
            )

        return {
            "predicted_class": pred_class,
            "confidence": confidence,
            "all_probabilities": {ID_TO_CLASS[i]: round(float(probs[i]), 4) for i in range(len(self.classes))},
            "summary": summary,
            "top_features": contributing_features
        }


if __name__ == "__main__":
    print("Testing NIDSExplainer on sample test flows...")
    test_sample_path = os.path.join(MODELS_DIR, "test_sample.parquet")
    df = pd.read_parquet(test_sample_path)
    
    explainer = NIDSExplainer()
    
    # Test on a few distinct attack samples
    for target_class in [1, 2, 3, 4]:
        subset = df[df["target"] == target_class]
        if not subset.empty:
            sample_row = subset.iloc[0]
            explanation = explainer.explain(sample_row)
            print("\n" + "=" * 60)
            print(f"Target: {ID_TO_CLASS[target_class]}")
            print(f"Predicted: {explanation['predicted_class']} (Confidence: {explanation['confidence']*100:.1f}%)")
            print(f"Summary: {explanation['summary']}")
            print("Top Contributing Features:")
            for f in explanation["top_features"][:3]:
                print(f"  #{f['rank']} {f['title']} ({f['feature']}): impact={f['impact']}, val={f['value']}")
