"""
Threat Engine for AI-NIDS.
Evaluates model predictions, calculates threat severity, generates alert records,
and persists flow logs and alerts into the database.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.db.models import FlowRecord, AlertRecord
from backend.inference.service import InferenceService
from ml.preprocessing.label_mapping import CLASS_SEVERITY


class ThreatEngine:
    def __init__(self, confidence_threshold: float = 0.75):
        self.confidence_threshold = confidence_threshold
        self.inference_service = InferenceService.get_instance()

    def process_flow(self, flow_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Process a network flow:
        1. Classify & explain via InferenceService
        2. Create FlowRecord
        3. If malicious, create AlertRecord
        4. Persist to DB
        """
        src_ip = flow_data.get("src_ip", "192.168.1.100")
        dst_ip = flow_data.get("dst_ip", "10.0.0.1")
        src_port = int(flow_data.get("src_port", 443))
        dst_port = int(flow_data.get("dst_port", 80))
        protocol = str(flow_data.get("protocol", "TCP"))
        duration_ms = float(flow_data.get("duration_ms", flow_data.get("Flow Duration", 0.0)) / 1000.0)
        bytes_total = int(flow_data.get("bytes_total", flow_data.get("Fwd Packets Length Total", 0) + flow_data.get("Bwd Packets Length Total", 0)))

        # Run inference and SHAP attribution
        prediction_result = self.inference_service.predict_flow(flow_data)
        predicted_class = prediction_result["predicted_class"]
        confidence = prediction_result["confidence"]
        summary = prediction_result["summary"]
        top_features = prediction_result["top_features"]

        # Persist flow
        flow_record = FlowRecord(
            src_ip=src_ip,
            dst_ip=dst_ip,
            src_port=src_port,
            dst_port=dst_port,
            protocol=protocol,
            duration_ms=duration_ms,
            bytes_total=bytes_total,
            label=predicted_class,
            confidence=confidence,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(flow_record)
        db.flush()  # assign flow_record.id

        alert_dict = None

        # Check if threat criteria met
        if predicted_class != "Normal" and confidence >= self.confidence_threshold:
            base_severity = CLASS_SEVERITY.get(predicted_class, "Medium")
            # Escalate severity if exceptionally high confidence
            severity = base_severity
            if base_severity == "Low" and confidence > 0.95:
                severity = "Medium"

            alert_record = AlertRecord(
                flow_id=flow_record.id,
                src_ip=src_ip,
                dst_ip=dst_ip,
                attack_type=predicted_class,
                confidence=confidence,
                severity=severity,
                summary=summary,
                top_features=top_features,
                status="New",
                created_at=datetime.now(timezone.utc)
            )
            db.add(alert_record)
            db.flush()
            alert_dict = alert_record.to_dict()

        db.commit()

        return {
            "flow": flow_record.to_dict(),
            "alert": alert_dict,
            "prediction": prediction_result
        }
