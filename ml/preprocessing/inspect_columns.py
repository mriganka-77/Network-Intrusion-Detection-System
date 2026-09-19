import glob
import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "archive")

def inspect_columns():
    f = glob.glob(os.path.join(DATA_DIR, "*.parquet"))[0]
    df = pd.read_parquet(f)
    print(f"Sample file: {os.path.basename(f)}")
    print(f"Shape: {df.shape}")
    print("\nColumns and Data Types:")
    for col, dtype in zip(df.columns, df.dtypes):
        print(f"  {col:<35} | {str(dtype):<10}")
        
    print("\nChecking infinities and nulls on sample file:")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    inf_counts = np.isinf(df[numeric_cols]).sum()
    infs = inf_counts[inf_counts > 0]
    nulls = df.isnull().sum()
    null_cols = nulls[nulls > 0]
    
    print(f"Columns with Infs:\n{infs if len(infs) > 0 else 'None'}")
    print(f"Columns with Nulls:\n{null_cols if len(null_cols) > 0 else 'None'}")

if __name__ == "__main__":
    inspect_columns()
