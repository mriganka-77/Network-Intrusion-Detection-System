"""
Human-readable label dictionary and explanation helpers for network flow features.
Maps raw technical CIC-IDS2017 feature names to SOC analyst-friendly descriptions.
"""

from typing import Dict, Any

FEATURE_HUMAN_LABELS: Dict[str, Dict[str, str]] = {
    # Packet & Byte Volume
    "Total Fwd Packets": {
        "title": "Outbound Packet Surge",
        "description": "Unusually high volume of outbound packets sent from source host."
    },
    "Total Backward Packets": {
        "title": "Inbound Packet Volume",
        "description": "Abnormal volume of response packets received from destination."
    },
    "Fwd Packets Length Total": {
        "title": "Total Outbound Data Volume",
        "description": "High total payload bytes transferred to destination."
    },
    "Bwd Packets Length Total": {
        "title": "Total Inbound Data Volume",
        "description": "High total payload bytes received from remote host."
    },
    "Flow Duration": {
        "title": "Flow Duration Anomaly",
        "description": "Atypical lifespan of the network connection."
    },
    "Flow Bytes/s": {
        "title": "High Byte Throughput",
        "description": "Sustained high data throughput rate indicating potential data exfiltration or flood."
    },
    "Flow Packets/s": {
        "title": "Packet Rate Spike",
        "description": "Extreme packet rate per second indicative of flooding or scanning."
    },
    "Fwd Packets/s": {
        "title": "Outbound Packet Flood",
        "description": "Rapid succession of forward packets sent per second."
    },
    "Bwd Packets/s": {
        "title": "Inbound Response Flood",
        "description": "Elevated response packet arrival rate."
    },

    # Packet Sizes
    "Fwd Packet Length Max": {
        "title": "Maximum Outbound Payload Size",
        "description": "Maximum byte size of outbound packets sent."
    },
    "Fwd Packet Length Min": {
        "title": "Minimum Outbound Payload Size",
        "description": "Presence of minimal or zero-length probing packets."
    },
    "Fwd Packet Length Mean": {
        "title": "Average Outbound Packet Size",
        "description": "Characteristic payload sizing matching known attack signatures."
    },
    "Fwd Packet Length Std": {
        "title": "Packet Size Jitter",
        "description": "Irregular variance in outbound packet payload lengths."
    },
    "Packet Length Min": {
        "title": "Zero/Small Payload Probe",
        "description": "Repeated empty packet headers typical of reconnaissance."
    },
    "Packet Length Max": {
        "title": "Jumbo Packet Anomaly",
        "description": "Abnormally large packet payload observed on wire."
    },
    "Packet Length Mean": {
        "title": "Mean Packet Size",
        "description": "Average packet size across the entire bidirectional flow."
    },

    # TCP Flags
    "SYN Flag Count": {
        "title": "Repeated SYN Connection Probes",
        "description": "High frequency of TCP SYN requests without completing full handshakes."
    },
    "ACK Flag Count": {
        "title": "ACK Packet Irregularity",
        "description": "Unexpected pattern of TCP ACK acknowledgments."
    },
    "RST Flag Count": {
        "title": "Abrupt Connection Resets",
        "description": "Elevated TCP RST flags signaling rejected connections or teardowns."
    },
    "PSH Flag Count": {
        "title": "Aggressive Push Flags",
        "description": "High use of TCP PSH flags to force immediate socket buffer delivery."
    },
    "FIN Flag Count": {
        "title": "Premature FIN Teardowns",
        "description": "Rapid sequence of connection closing packets."
    },

    # Inter-Arrival Times (IAT)
    "Flow IAT Mean": {
        "title": "Connection Timing Cadence",
        "description": "Consistent or periodic timing interval between consecutive packets."
    },
    "Flow IAT Std": {
        "title": "Timing Variance Anomaly",
        "description": "Unnatural lack of human jitter or irregular burst timing."
    },
    "Flow IAT Max": {
        "title": "Max Inter-Arrival Gap",
        "description": "Prolonged inactivity gap between packet transmissions."
    },
    "Flow IAT Min": {
        "title": "Microsecond Packet Interval",
        "description": "Near-zero time gap between successive packets indicating automated tooling."
    },
    "Fwd IAT Total": {
        "title": "Outbound Transmission Span",
        "description": "Total elapsed time between first and last outbound packets."
    },

    # TCP Window & Subflows
    "Init Fwd Win Bytes": {
        "title": "Suspicious Initial TCP Window",
        "description": "TCP client window advertising signature characteristic of automated bots."
    },
    "Init Bwd Win Bytes": {
        "title": "Server Window Size",
        "description": "Remote TCP receive window configuration."
    },
    "Fwd Act Data Packets": {
        "title": "Data-Bearing Packets",
        "description": "Number of outbound packets carrying actual application payload."
    },
    "Fwd Seg Size Min": {
        "title": "Minimum Segment Header Size",
        "description": "Compact TCP header sizing commonly produced by custom exploit tools."
    },
    "Down/Up Ratio": {
        "title": "Download/Upload Asymmetry",
        "description": "Disproportionate ratio between received and transmitted traffic."
    }
}


def get_feature_meta(feature_name: str) -> Dict[str, str]:
    """Retrieve human-friendly title and explanation for a given feature."""
    clean_name = feature_name.strip()
    if clean_name in FEATURE_HUMAN_LABELS:
        return FEATURE_HUMAN_LABELS[clean_name]
    
    # Fallback to a formatted version of the raw name
    return {
        "title": clean_name.replace("_", " ").title(),
        "description": f"Observed abnormal metric for {clean_name}."
    }
