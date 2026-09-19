import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Sparkles, Filter, ShieldCheck } from 'lucide-react';

export default function AlertTable({ alerts = [], onSelectAlert, onRefresh }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    return true;
  });

  const severityBadgeClass = {
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Table Header & Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="#f43f5e" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Live Security Alerts Feed
          </h3>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            color: '#fda4af',
            fontWeight: 600,
          }}>
            {filteredAlerts.length} Active
          </span>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Severity:</span>
            {['ALL', 'High', 'Medium', 'Low'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  background: severityFilter === sev ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: severityFilter === sev ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                  color: severityFilter === sev ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: severityFilter === sev ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'New', 'Acknowledged'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  background: statusFilter === st ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: statusFilter === st ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: statusFilter === st ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      {filteredAlerts.length === 0 ? (
        <div style={{
          padding: '48px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <ShieldCheck size={44} color="#10b981" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>No threats currently flagged</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Start the simulated traffic replay to inspect incoming threat detections.
          </span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '10px 14px' }}>Severity</th>
                <th style={{ padding: '10px 14px' }}>Time</th>
                <th style={{ padding: '10px 14px' }}>Attack Vector</th>
                <th style={{ padding: '10px 14px' }}>Source → Target</th>
                <th style={{ padding: '10px 14px' }}>Confidence</th>
                <th style={{ padding: '10px 14px' }}>Key Trigger</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Explainability</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const badge = severityBadgeClass[alert.severity] || 'badge-low';
                const timeStr = new Date(alert.timestamp).toLocaleTimeString();
                const primaryTrigger = alert.top_features?.[0]?.title || 'Network anomaly';

                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px' }}>
                      <span className={`btn ${badge}`} style={{ padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {alert.severity}
                      </span>
                    </td>

                    <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {timeStr}
                    </td>

                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {alert.attack_type}
                    </td>

                    <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#67e8f9' }}>{alert.src_ip}</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                      <span style={{ color: '#fda4af' }}>{alert.dst_ip}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '50px', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${alert.confidence * 100}%`, height: '100%', background: '#06b6d4', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {(alert.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {primaryTrigger}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlert(alert);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        <Sparkles size={13} color="#06b6d4" />
                        Explain
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
