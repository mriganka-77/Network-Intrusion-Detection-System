"""
Data loader module for AI-NIDS.
Loads directly from archive/*.parquet in-memory, maps labels to canonical classes,
and returns balanced train/test splits without writing redundant copies to disk.
"""

import os
import glob
import json
import numpy as np
import pandas as pd
from typing import Tuple, List
from sklearn.model_selection import train_test_split
from ml.preprocessing.label_mapping import map_label, CANONICAL_CLASSES, CLASS_TO_ID

ARCHIVE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "archive")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "feature_schema.json")


def load_feature_schema() -> dict:
    """Load frozen feature schema."""
    with open(SCHEMA_FILE, "r") as f:
        return json.load(f)


def load_data_from_archive(
    benign_sample_size: int = 100000,
    dos_sample_size: int = 80000,
    test_size: float = 0.20,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, List[str]]:
    """
    Directly loads parquet files from archive/ into memory,
    maps labels, samples for class balance while keeping 100% of minority attacks,
    and returns (X_train, X_test, y_train, y_test, feature_names).
    """
    schema = load_feature_schema()
    feature_names = schema["features"]
    
    parquet_files = sorted(glob.glob(os.path.join(ARCHIVE_DIR, "*.parquet")))
    if not parquet_files:
        raise FileNotFoundError(f"No parquet files found in {ARCHIVE_DIR}")

    print(f"Loading {len(parquet_files)} parquet files directly from {ARCHIVE_DIR}...")
    dfs = []
    for pf in parquet_files:
        fname = os.path.basename(pf)
        df = pd.read_parquet(pf)
        # Harmonize label column
        label_col = [c for c in df.columns if c.lower() == "label"][0]
        df["Canonical_Label"] = df[label_col].astype(str).apply(map_label)
        dfs.append(df)

    full_df = pd.concat(dfs, ignore_index=True)
    print(f"Total raw rows loaded: {len(full_df):,}")

    # Class balance sampling: keep 100% of rare attacks, sample benign and DoS
    sampled_dfs = []
    for cls in CANONICAL_CLASSES:
        cls_df = full_df[full_df["Canonical_Label"] == cls]
        cls_count = len(cls_df)
        
        if cls == "Normal":
            n = min(benign_sample_size, cls_count)
            sampled = cls_df.sample(n=n, random_state=random_state)
        elif cls == "DoS/DDoS":
            n = min(dos_sample_size, cls_count)
            sampled = cls_df.sample(n=n, random_state=random_state)
        else:
            # 100% of minority attacks preserved!
            sampled = cls_df
            
        print(f"  {cls:<12}: using {len(sampled):,} rows (from {cls_count:,} total)")
        sampled_dfs.append(sampled)

    combined = pd.concat(sampled_dfs, ignore_index=True)
    print(f"\nFinal in-memory balanced dataset: {len(combined):,} rows")

    # Features and labels
    X = combined[feature_names].copy()
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X.fillna(0, inplace=True)
    
    y = combined["Canonical_Label"].map(CLASS_TO_ID)

    # Train/test stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    print(f"Train split: {len(X_train):,} samples | Test split: {len(X_test):,} samples\n")
    return X_train, X_test, y_train, y_test, feature_names


if __name__ == "__main__":
    X_train, X_test, y_train, y_test, features = load_data_from_archive()
    print("Direct loading from archive/ verified successfully!")
