"""
Inference service for AI-NIDS.
Provides cached singleton model and SHAP explainer for real-time predictions.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Union

from ml.preprocessing.data_loader import load_feature_schema
from ml.preprocessing.label_mapping import CANONICAL_CLASSES, ID_TO_CLASS
from backend.explainability.explainer import NIDSExplainer

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")


class InferenceService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        print("Loading InferenceService and SHAP Explainer...")
        self.explainer = NIDSExplainer()
        self.feature_names = self.explainer.feature_names
        self.classes = CANONICAL_CLASSES
        print("InferenceService initialized successfully.")

    def predict_flow(self, flow_features: Union[dict, pd.Series, pd.DataFrame]) -> Dict[str, Any]:
        """Perform classification and explainability on a flow."""
        return self.explainer.explain(flow_features, top_k=5)
