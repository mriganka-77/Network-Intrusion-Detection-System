import React from 'react';
import { X, ShieldAlert, Sparkles, Activity, CheckCircle2, EyeOff, Clock, Network } from 'lucide-react';

export default function ExplainabilityDrawer({ alert, onClose, onUpdateStatus }) {
  if (!alert) return null;

  const severityBadges = {
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };

  const topFeatures = alert.top_features || [];
  const maxImpact = Math.max(...topFeatures.map(f => Math.abs(f.impact || 0)), 1.0);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'rgba(16, 23, 39, 0.6)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`btn ${severityBadges[alert.severity] || 'badge-low'}`} style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                {alert.severity} Severity
              </span>
              <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                Status: {alert.status}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {alert.attack_type}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Clock size={14} />
              <span>{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Connection Metadata Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              <Network size={14} color="#06b6d4" />
              <span>Network Flow Telemetry</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Host</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#67e8f9', marginTop: '2px' }}>
                  {alert.src_ip}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Host</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fda4af', marginTop: '2px' }}>
                  {alert.dst_ip}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model Confidence</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{(alert.confidence * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${alert.confidence * 100}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #38bdf8)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          {/* Plain English Analyst Rationale */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.08))',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '10px',
            padding: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#67e8f9', fontSize: '0.85rem', fontWeight: 700 }}>
              <Sparkles size={16} />
              <span>AI Analyst Rationale</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#f1f5f9' }}>
              {alert.summary}
            </p>
          </div>

          {/* SHAP Feature Contribution Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Activity size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Contributing Flow Signatures (SHAP)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topFeatures.map((feat) => {
                const impactWidth = (Math.abs(feat.impact) / maxImpact) * 100;
                return (
                  <div
                    key={feat.feature}
                    style={{
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          #{feat.rank} {feat.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {feat.feature} = {feat.value?.toLocaleString()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: feat.impact >= 0 ? '#f43f5e' : '#34d399',
                        }}>
                          {feat.impact >= 0 ? `+${feat.impact.toFixed(4)}` : feat.impact.toFixed(4)}
                        </span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SHAP score</div>
                      </div>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      margin: '8px 0',
                    }}>
                      <div style={{
                        width: `${Math.max(5, impactWidth)}%`,
                        height: '100%',
                        backgroundColor: '#06b6d4',
                        borderRadius: '3px',
                        boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                      }} />
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {feat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '18px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(16, 23, 39, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <button
            onClick={() => onUpdateStatus(alert.id, 'Dismissed')}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <EyeOff size={16} />
            Dismiss
          </button>
          <button
            onClick={() => onUpdateStatus(alert.id, 'Acknowledged')}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <CheckCircle2 size={16} />
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
