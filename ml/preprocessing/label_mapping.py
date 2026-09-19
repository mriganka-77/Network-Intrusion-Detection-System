"""
Label mapping module for AI-NIDS.
Harmonizes raw CIC-IDS2017 label strings into 6 target classes.
"""

from typing import Dict, List

# Mapping from raw CIC-IDS2017 dataset labels to 6 target canonical classes
RAW_TO_CANONICAL: Dict[str, str] = {
    # Benign / Normal
    "Benign": "Normal",
    
    # DoS / DDoS attacks
    "DoS Hulk": "DoS/DDoS",
    "DDoS": "DoS/DDoS",
    "DoS GoldenEye": "DoS/DDoS",
    "DoS slowloris": "DoS/DDoS",
    "DoS Slowhttptest": "DoS/DDoS",
    "Heartbleed": "DoS/DDoS",
    
    # Brute Force attacks
    "FTP-Patator": "Brute Force",
    "SSH-Patator": "Brute Force",
    "Web Attack  Brute Force": "Brute Force",
    "Web Attack - Brute Force": "Brute Force",
    
    # Port Scan
    "PortScan": "Port Scan",
    
    # Botnet
    "Bot": "Botnet",
    
    # Other / Web Attacks / Infiltration
    "Web Attack  XSS": "Other",
    "Web Attack - XSS": "Other",
    "Web Attack  Sql Injection": "Other",
    "Web Attack - Sql Injection": "Other",
    "Infiltration": "Other",
}

# Canonical class list with consistent ordering
CANONICAL_CLASSES: List[str] = [
    "Normal",
    "DoS/DDoS",
    "Brute Force",
    "Port Scan",
    "Botnet",
    "Other",
]

CLASS_TO_ID: Dict[str, int] = {name: idx for idx, name in enumerate(CANONICAL_CLASSES)}
ID_TO_CLASS: Dict[int, str] = {idx: name for idx, name in enumerate(CANONICAL_CLASSES)}

# Severity mapping for threat engine
CLASS_SEVERITY: Dict[str, str] = {
    "Normal": "None",
    "Port Scan": "Low",
    "Other": "Medium",
    "Brute Force": "High",
    "Botnet": "High",
    "DoS/DDoS": "High",
}

def map_label(raw_label: str) -> str:
    """Map raw label string to canonical class."""
    clean_str = str(raw_label).strip()
    if clean_str in RAW_TO_CANONICAL:
        return RAW_TO_CANONICAL[clean_str]
    # Fallback search
    for k, v in RAW_TO_CANONICAL.items():
        if k.lower() in clean_str.lower() or clean_str.lower() in k.lower():
            return v
    return "Other"
