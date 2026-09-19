import os
import glob
import pandas as pd
import pyarrow.parquet as pq

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "archive")

def profile_dataset():
    files = sorted(glob.glob(os.path.join(DATA_DIR, "*.parquet")))
    print(f"Found {len(files)} parquet files in {DATA_DIR}\n" + "="*60)
    
    total_rows = 0
    all_columns = set()
    label_distribution = {}

    for f in files:
        filename = os.path.basename(f)
        meta = pq.read_metadata(f)
        num_rows = meta.num_rows
        num_cols = meta.num_columns
        total_rows += num_rows
        
        # Read a small batch or just the schema and label column
        schema = pq.read_schema(f)
        cols = schema.names
        all_columns.update(cols)
        
        # Check label column
        label_col = [c for c in cols if "label" in c.lower()]
        label_name = label_col[0] if label_col else None
        
        if label_name:
            df_label = pd.read_parquet(f, columns=[label_name])
            counts = df_label[label_name].value_counts().to_dict()
            for k, v in counts.items():
                label_distribution[str(k)] = label_distribution.get(str(k), 0) + v
        else:
            counts = "No label column found!"
            
        print(f"File: {filename}")
        print(f"  Rows: {num_rows:,} | Columns: {num_cols}")
        print(f"  Labels: {counts}\n")

    print("="*60)
    print(f"Total Rows across all files: {total_rows:,}")
    print(f"Total Unique Columns: {len(all_columns)}")
    print("\nAggregate Label Distribution:")
    for label, count in sorted(label_distribution.items(), key=lambda x: x[1], reverse=True):
        pct = (count / total_rows) * 100
        print(f"  {label:<32}: {count:>9,} ({pct:6.2f}%)")

if __name__ == "__main__":
    profile_dataset()
