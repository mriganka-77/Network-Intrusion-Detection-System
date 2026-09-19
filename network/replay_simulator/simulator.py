"""
Replay Simulator for AI-NIDS.
Streams network flows from pre-recorded datasets to simulate live traffic,
synthesizes realistic IP headers, and feeds them into the Threat Engine.
"""

import os
import time
import random
import threading
import pandas as pd
from typing import Dict, Any, Optional

from backend.db.session import SessionLocal
from backend.threat_engine.engine import ThreatEngine

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")
SAMPLE_PATH = os.path.join(MODELS_DIR, "test_sample.parquet")


class ReplaySimulator:
    _instance = None
    _lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def __init__(self):
        self.is_running = False
        self.thread: Optional[threading.Thread] = None
        self.flows_streamed = 0
        self.threats_flagged = 0
        self.delay_seconds = 0.5  # default 2 flows per second
        self.threat_engine: Optional[ThreatEngine] = None
        self.sample_df: Optional[pd.DataFrame] = None
        self._load_sample_data()

    def _load_sample_data(self):
        if os.path.exists(SAMPLE_PATH):
            self.sample_df = pd.read_parquet(SAMPLE_PATH)
            print(f"ReplaySimulator loaded {len(self.sample_df):,} test flows for replay.")
        else:
            print(f"Warning: ReplaySimulator sample file not found at {SAMPLE_PATH}")

    def _synthesize_headers(self, row: pd.Series) -> Dict[str, Any]:
        """Generate realistic synthetic IPs and ports based on attack profile."""
        target_class = int(row.get("target", 0))

        if target_class == 0:  # Normal
            src_ip = f"192.168.1.{random.randint(10, 80)}"
            dst_ip = random.choice(["10.0.0.1", "172.217.16.206", "142.250.190.46", "10.0.0.5"])
            dst_port = random.choice([80, 443, 53, 8080])
            src_port = random.randint(30000, 65000)
            protocol = "TCP" if dst_port in [80, 443, 8080] else "UDP"
        elif target_class == 1:  # DoS/DDoS
            src_ip = f"172.16.{random.randint(1, 20)}.{random.randint(2, 254)}"
            dst_ip = "10.0.0.5"  # Target server
            dst_port = random.choice([80, 443])
            src_port = random.randint(1024, 65535)
            protocol = "TCP"
        elif target_class == 2:  # Brute Force
            src_ip = f"198.51.100.{random.randint(10, 40)}"
            dst_ip = "10.0.0.2"
            dst_port = random.choice([22, 21, 80])
            src_port = random.randint(40000, 60000)
            protocol = "TCP"
        elif target_class == 3:  # Port Scan
            src_ip = "203.0.113.88"
            dst_ip = "10.0.0.5"
            dst_port = random.choice([21, 22, 23, 25, 80, 110, 443, 445, 1433, 3306, 8080])
            src_port = random.randint(50000, 65000)
            protocol = "TCP"
        elif target_class == 4:  # Botnet
            src_ip = f"192.168.1.{random.randint(100, 120)}"
            dst_ip = "185.220.101.5"  # External C2
            dst_port = random.choice([6667, 8000, 4444, 443])
            src_port = random.randint(32000, 60000)
            protocol = "TCP"
        else:  # Other
            src_ip = f"198.18.{random.randint(1, 10)}.{random.randint(1, 50)}"
            dst_ip = "10.0.0.5"
            dst_port = 80
            src_port = random.randint(20000, 60000)
            protocol = "TCP"

        return {
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": protocol,
        }

    def _worker(self):
        print("Replay simulator thread started.")
        if self.threat_engine is None:
            self.threat_engine = ThreatEngine()

        if self.sample_df is None or self.sample_df.empty:
            self._load_sample_data()

        if self.sample_df is None or self.sample_df.empty:
            print("Error: No test sample data to replay!")
            self.is_running = False
            return

        db = SessionLocal()
        try:
            while self.is_running:
                # Random weighted sample: 60% normal, 40% attacks for active demo feedback
                if random.random() < 0.60:
                    candidates = self.sample_df[self.sample_df["target"] == 0]
                else:
                    candidates = self.sample_df[self.sample_df["target"] != 0]

                if candidates.empty:
                    row = self.sample_df.sample(1).iloc[0]
                else:
                    row = candidates.sample(1).iloc[0]

                headers = self._synthesize_headers(row)
                flow_data = row.to_dict()
                flow_data.update(headers)

                # Process flow through threat engine
                result = self.threat_engine.process_flow(flow_data, db)
                self.flows_streamed += 1

                if result.get("alert"):
                    self.threats_flagged += 1

                time.sleep(self.delay_seconds)
        except Exception as e:
            print(f"Error in replay simulator: {e}")
        finally:
            db.close()
            self.is_running = False
            print("Replay simulator thread exited.")

    def set_rate(self, rate_hz: float):
        """Dynamically adjust speed on the fly."""
        self.delay_seconds = max(0.01, 1.0 / float(rate_hz))
        return {
            "status": "speed_updated", 
            "rate_hz": rate_hz, 
            "delay_seconds": self.delay_seconds,
            "is_running": self.is_running
        }

    def start(self, rate_hz: float = 2.0):
        self.delay_seconds = max(0.01, 1.0 / float(rate_hz))
        if self.is_running:
            return {
                "status": "speed_updated", 
                "rate_hz": rate_hz, 
                "delay_seconds": self.delay_seconds,
                "flows_streamed": self.flows_streamed
            }

        self.is_running = True
        self.thread = threading.Thread(target=self._worker, daemon=True)
        self.thread.start()
        return {"status": "started", "rate_hz": rate_hz, "delay_seconds": self.delay_seconds}

    def stop(self):
        if not self.is_running:
            return {"status": "not_running", "flows_streamed": self.flows_streamed}

        self.is_running = False
        if self.thread:
            self.thread.join(timeout=2.0)
        return {"status": "stopped", "flows_streamed": self.flows_streamed, "threats_flagged": self.threats_flagged}

    def get_status(self):
        return {
            "is_running": self.is_running,
            "flows_streamed": self.flows_streamed,
            "threats_flagged": self.threats_flagged,
            "delay_seconds": self.delay_seconds
        }
