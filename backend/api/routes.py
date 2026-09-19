"""
FastAPI route handlers for AI-NIDS.
Exposes endpoints for telemetry, threat stats, alerts feed, simulation controls, and inference.
"""

import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.db.session import get_db
from backend.db.models import FlowRecord, AlertRecord
from backend.inference.service import InferenceService
from network.replay_simulator.simulator import ReplaySimulator

router = APIRouter()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PDF_PATH = os.path.join(BASE_DIR, "AI_NIDS_Comprehensive_Guide.pdf")


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="New status: 'Acknowledged' or 'Dismissed'")


class SimulateStartRequest(BaseModel):
    rate_hz: float = Field(2.0, ge=0.1, le=100.0, description="Replay rate in flows per second")


class SpeedUpdateRequest(BaseModel):
    rate_hz: float = Field(..., ge=0.1, le=100.0, description="Replay rate in flows per second")


@router.get("/health")
def health_check():
    """Service liveness and readiness check."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "AI-NIDS REST API",
        "version": "1.0.0"
    }


@router.get("/stats/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    """Summary metrics: total flows, attacks count, active threats, total bytes."""
    total_flows = db.query(func.count(FlowRecord.id)).scalar() or 0
    total_attacks = db.query(func.count(AlertRecord.id)).scalar() or 0
    active_threats = db.query(func.count(AlertRecord.id)).filter(AlertRecord.status == "New").scalar() or 0
    total_bytes = db.query(func.sum(FlowRecord.bytes_total)).scalar() or 0

    return {
        "total_flows": total_flows,
        "total_attacks": total_attacks,
        "active_threats": active_threats,
        "total_bytes": total_bytes,
        "bytes_formatted": format_bytes(total_bytes)
    }


@router.get("/stats/distribution")
def get_attack_distribution(db: Session = Depends(get_db)):
    """Breakdown of detected attacks by class for dashboard charts."""
    results = (
        db.query(AlertRecord.attack_type, func.count(AlertRecord.id).label("count"))
        .group_by(AlertRecord.attack_type)
        .order_by(desc("count"))
        .all()
    )
    return [{"attack_type": r[0], "count": r[1]} for r in results]


@router.get("/alerts/recent")
def get_recent_alerts(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve paginated list of alerts."""
    query = db.query(AlertRecord)
    if severity:
        query = query.filter(AlertRecord.severity == severity)
    if status:
        query = query.filter(AlertRecord.status == status)

    total = query.count()
    alerts = query.order_by(desc(AlertRecord.created_at)).offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "alerts": [a.to_dict() for a in alerts]
    }


@router.get("/alerts/{alert_id}")
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    """Fetch full alert detail with SHAP explanation and associated flow data."""
    alert = db.query(AlertRecord).filter(AlertRecord.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")

    alert_dict = alert.to_dict()
    if alert.flow:
        alert_dict["flow"] = alert.flow.to_dict()

    return alert_dict


@router.patch("/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, req: StatusUpdateRequest, db: Session = Depends(get_db)):
    """Acknowledge or dismiss an alert."""
    if req.status not in ["New", "Acknowledged", "Dismissed"]:
        raise HTTPException(status_code=400, detail="Status must be 'New', 'Acknowledged', or 'Dismissed'")

    alert = db.query(AlertRecord).filter(AlertRecord.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = req.status
    db.commit()
    return alert.to_dict()


@router.post("/simulate/start")
def start_simulation(req: SimulateStartRequest = SimulateStartRequest()):
    """Start replaying network flows in background."""
    simulator = ReplaySimulator.get_instance()
    return simulator.start(rate_hz=req.rate_hz)


@router.post("/simulate/speed")
def update_simulation_speed(req: SpeedUpdateRequest):
    """Adjust replay rate dynamically while running."""
    simulator = ReplaySimulator.get_instance()
    return simulator.set_rate(rate_hz=req.rate_hz)


@router.post("/simulate/stop")
def stop_simulation():
    """Stop replaying network flows."""
    simulator = ReplaySimulator.get_instance()
    return simulator.stop()


@router.get("/simulate/status")
def simulation_status():
    """Check current simulation status."""
    simulator = ReplaySimulator.get_instance()
    return simulator.get_status()


@router.post("/predict")
def predict_single_flow(flow_features: Dict[str, Any]):
    """Classify an ad-hoc flow vector and return top-5 SHAP explanations."""
    inference_service = InferenceService.get_instance()
    return inference_service.predict_flow(flow_features)


@router.delete("/reset")
def reset_database(db: Session = Depends(get_db)):
    """Clear all flows and alerts for a fresh demo run."""
    simulator = ReplaySimulator.get_instance()
    if simulator.is_running:
        simulator.stop()
        
    db.query(AlertRecord).delete()
    db.query(FlowRecord).delete()
    db.commit()
    return {"status": "success", "message": "All flow and alert records purged"}


@router.get("/report/pdf")
def download_pdf_guide():
    """Download the comprehensive AI-NIDS PDF guide."""
    if not os.path.exists(PDF_PATH):
        raise HTTPException(status_code=404, detail="PDF report not found. Run generate_report_pdf.py first.")
    return FileResponse(
        PDF_PATH,
        media_type="application/pdf",
        filename="AI_NIDS_Comprehensive_Guide.pdf"
    )


def format_bytes(bytes_num: int) -> str:
    """Format byte integers into human-readable strings."""
    if not bytes_num:
        return "0 B"
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if bytes_num < 1024.0:
            return f"{bytes_num:.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} PB"
