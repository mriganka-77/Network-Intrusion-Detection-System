"""
SQLAlchemy database models for AI-NIDS persistence layer.
Implements flows table (all network traffic) and alerts table (flagged threats).
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class FlowRecord(Base):
    __tablename__ = "flows"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    src_ip = Column(String(45), nullable=False)
    dst_ip = Column(String(45), nullable=False)
    src_port = Column(Integer, nullable=False)
    dst_port = Column(Integer, nullable=False)
    protocol = Column(String(10), nullable=False)
    duration_ms = Column(Float, default=0.0)
    bytes_total = Column(Integer, default=0)
    label = Column(String(30), nullable=False, index=True)
    confidence = Column(Float, nullable=False)

    alert = relationship("AlertRecord", back_populates="flow", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "src_ip": self.src_ip,
            "dst_ip": self.dst_ip,
            "src_port": self.src_port,
            "dst_port": self.dst_port,
            "protocol": self.protocol,
            "duration_ms": self.duration_ms,
            "bytes_total": self.bytes_total,
            "label": self.label,
            "confidence": self.confidence,
        }


class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flow_id = Column(String(36), ForeignKey("flows.id", ondelete="CASCADE"), nullable=False)
    src_ip = Column(String(45), nullable=False, index=True)
    dst_ip = Column(String(45), nullable=False)
    attack_type = Column(String(30), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    severity = Column(String(10), nullable=False, index=True)  # Low, Medium, High
    summary = Column(Text, nullable=False)
    top_features = Column(JSON, nullable=False)  # List of {rank, feature, title, impact, value, label}
    status = Column(String(20), default="New", index=True)  # New, Acknowledged, Dismissed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    flow = relationship("FlowRecord", back_populates="alert")

    def to_dict(self):
        return {
            "id": self.id,
            "flow_id": self.flow_id,
            "timestamp": self.created_at.isoformat(),
            "src_ip": self.src_ip,
            "dst_ip": self.dst_ip,
            "attack_type": self.attack_type,
            "confidence": round(self.confidence, 4),
            "severity": self.severity,
            "summary": self.summary,
            "top_features": self.top_features,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
