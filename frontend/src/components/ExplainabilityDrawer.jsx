import React from 'react';
import { X, ShieldAlert, Sparkles, Activity, CheckCircle2, EyeOff, Clock, Network, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

export default function ExplainabilityDrawer({ alert, onClose, onUpdateStatus }) {
  if (!alert) return null;

  const severityBadges = {
    High: 'glass-badge-high',
    Medium: 'glass-badge-medium',
    Low: 'glass-badge-low',
  };

  const topFeatures = alert.top_features || [];
  const maxImpact = Math.max(...topFeatures.map(f => Math.abs(f.impact || 0)), 1.0);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '26px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'rgba(15, 23, 42, 0.75)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`glass-badge ${severityBadges[alert.severity] || 'glass-badge-low'}`}>
                {alert.severity} Severity
              </span>
              <span className="glass-badge" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-secondary)' }}>
                Status: {alert.status}
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {alert.attack_type}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Clock size={14} />
              <span>{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <Tooltip
            title="Close Drawer"
            description="Exits the explainability inspection view and returns to the live SOC feed."
            position="bottom"
          >
            <button
              onClick={onClose}
              className="liquid-btn liquid-btn-glass"
              style={{ padding: '8px', borderRadius: '10px' }}
            >
              <X size={18} />
            </button>
          </Tooltip>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Connection Metadata Box */}
          <div className="liquid-glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              <Network size={14} color="#06b6d4" />
              <span>Network Flow Telemetry</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Attacker IP</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#67e8f9', fontWeight: 700, marginTop: '2px' }}>
                  {alert.src_ip}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Host IP</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#fda4af', fontWeight: 700, marginTop: '2px' }}>
                  {alert.dst_ip}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Algorithm Confidence</span>
                <span style={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{(alert.confidence * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${alert.confidence * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #06b6d4, #6366f1)', 
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)'
                }} />
              </div>
            </div>
          </div>

          {/* Plain English Analyst Rationale */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.12))',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#67e8f9', fontSize: '0.85rem', fontWeight: 800 }}>
              <Sparkles size={16} />
              <span>AI Analyst Plain-English Rationale</span>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.55', color: '#f8fafc', fontWeight: 500 }}>
              {alert.summary}
            </p>
          </div>

          {/* SHAP Feature Contribution Breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#06b6d4" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Top Contributing Clues (SHAP Attribution)
                </h3>
              </div>
              <Tooltip
                title="What is SHAP?"
                description="SHAP (SHapley Additive exPlanations) calculates exactly how much each measurement pushed the decision toward the alarm."
                badge="XAI"
                position="left"
              >
                <HelpCircle size={15} color="var(--text-muted)" style={{ cursor: 'help' }} />
              </Tooltip>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topFeatures.map((feat) => {
                const impactWidth = (Math.abs(feat.impact) / maxImpact) * 100;
                return (
                  <Tooltip
                    key={feat.feature}
                    title={feat.title}
                    description={feat.label}
                    details={`Wire measurement: ${feat.feature} = ${feat.value?.toLocaleString()}`}
                    badge={`SHAP: +${feat.impact.toFixed(2)}`}
                    position="left"
                    maxWidth="300px"
                  >
                    <div
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        cursor: 'help',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            #{feat.rank} {feat.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {feat.feature} = {feat.value?.toLocaleString()}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            color: feat.impact >= 0 ? '#f43f5e' : '#34d399',
                          }}>
                            {feat.impact >= 0 ? `+${feat.impact.toFixed(4)}` : feat.impact.toFixed(4)}
                          </span>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>attribution weight</div>
                        </div>
                      </div>

                      {/* 3D Liquid Bar */}
                      <div style={{
                        width: '100%',
                        height: '7px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        margin: '8px 0',
                      }}>
                        <div style={{
                          width: `${Math.max(6, impactWidth)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)',
                        }} />
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {feat.label}
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions with Tooltips */}
        <div style={{
          padding: '20px 26px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.9)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '14px',
        }}>
          <Tooltip
            title="Dismiss Alert"
            description="Silences this alarm, marks it as benign/investigated, and removes it from the active review queue."
            badge="Review Action"
            position="top"
          >
            <button
              onClick={() => onUpdateStatus(alert.id, 'Dismissed')}
              className="liquid-btn liquid-btn-glass"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <EyeOff size={16} />
              Dismiss Alert
            </button>
          </Tooltip>

          <Tooltip
            title="Acknowledge Threat"
            description="Confirms that a security analyst has seen this incident and is actively addressing the security risk."
            badge="Review Action"
            position="top"
          >
            <button
              onClick={() => onUpdateStatus(alert.id, 'Acknowledged')}
              className="liquid-btn liquid-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <CheckCircle2 size={16} />
              Acknowledge Threat
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
