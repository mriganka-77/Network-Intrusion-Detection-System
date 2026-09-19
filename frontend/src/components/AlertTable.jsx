import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Sparkles, Filter, ShieldCheck, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

export default function AlertTable({ alerts = [], onSelectAlert, onRefresh }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    return true;
  });

  const severityBadgeClass = {
    High: 'glass-badge-high',
    Medium: 'glass-badge-medium',
    Low: 'glass-badge-low',
  };

  const filterExplanations = {
    ALL: { title: 'Show All Severities', desc: 'Displays all flagged network alerts regardless of threat impact rating.' },
    High: { title: 'High Severity Filter', desc: 'Shows critical threats (DoS/DDoS, Brute Force, Botnets) requiring immediate response.' },
    Medium: { title: 'Medium Severity Filter', desc: 'Shows suspicious web injections, XSS attempts, or unusual volume anomalies.' },
    Low: { title: 'Low Severity Filter', desc: 'Shows early-stage reconnaissance activities like port scans and connection probes.' },
  };

  const statusExplanations = {
    ALL: { title: 'Show All Statuses', desc: 'Includes both unreviewed (New) and reviewed (Acknowledged) alerts.' },
    New: { title: 'New Alerts Filter', desc: 'Displays unreviewed threats currently awaiting SOC analyst triage.' },
    Acknowledged: { title: 'Acknowledged Filter', desc: 'Displays threats that have been investigated and tagged by security staff.' },
  };

  return (
    <div className="liquid-glass-card" style={{ padding: '26px' }}>
      {/* Table Header & Interactive Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            boxShadow: '0 0 14px rgba(244, 63, 94, 0.3)',
          }}>
            <AlertTriangle size={20} color="#f43f5e" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Live Security Alerts Feed
              </h3>
              <span className="glass-badge glass-badge-high">
                {filteredAlerts.length} Active
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time threat feed evaluated by XGBoost & SHAP
            </span>
          </div>
        </div>

        {/* Filter Controls with Tooltips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Severity Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</span>
            {['ALL', 'High', 'Medium', 'Low'].map(sev => (
              <Tooltip
                key={sev}
                title={filterExplanations[sev].title}
                description={filterExplanations[sev].desc}
                badge="Filter"
                position="bottom"
              >
                <button
                  onClick={() => setSeverityFilter(sev)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: severityFilter === sev 
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(2, 132, 199, 0.9))' 
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: severityFilter === sev ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    color: severityFilter === sev ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: severityFilter === sev ? 700 : 500,
                    boxShadow: severityFilter === sev ? '0 0 10px rgba(6, 182, 212, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {sev}
                </button>
              </Tooltip>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            {['ALL', 'New', 'Acknowledged'].map(st => (
              <Tooltip
                key={st}
                title={statusExplanations[st].title}
                description={statusExplanations[st].desc}
                badge="Filter"
                position="bottom"
              >
                <button
                  onClick={() => setStatusFilter(st)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: statusFilter === st 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.85), rgba(129, 140, 248, 0.9))' 
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: statusFilter === st ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: statusFilter === st ? 700 : 500,
                    boxShadow: statusFilter === st ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {st}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      {filteredAlerts.length === 0 ? (
        <div style={{
          padding: '52px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
            marginBottom: '14px',
          }}>
            <ShieldCheck size={40} color="#10b981" strokeWidth={1.75} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Threats Flagged
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Click <strong>"Replay Live Traffic"</strong> above to start streaming network flows and observe live detections.
          </span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                color: 'var(--text-muted)', 
                fontSize: '0.74rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em' 
              }}>
                <th style={{ padding: '12px 14px' }}>
                  <Tooltip title="Severity" description="Calculated danger rating (High, Medium, Low) based on attack category." position="bottom">
                    <span style={{ cursor: 'help' }}>Severity</span>
                  </Tooltip>
                </th>
                <th style={{ padding: '12px 14px' }}>
                  <Tooltip title="Timestamp" description="Exact time the network flow arrived and was processed." position="bottom">
                    <span style={{ cursor: 'help' }}>Time</span>
                  </Tooltip>
                </th>
                <th style={{ padding: '12px 14px' }}>
                  <Tooltip title="Attack Vector" description="Specific cyberattack family diagnosed by the XGBoost ML model." position="bottom">
                    <span style={{ cursor: 'help' }}>Attack Vector</span>
                  </Tooltip>
                </th>
                <th style={{ padding: '12px 14px' }}>
                  <Tooltip title="Endpoints" description="Source IP address communicating with the Target Server IP." position="bottom">
                    <span style={{ cursor: 'help' }}>Source → Target</span>
                  </Tooltip>
                </th>
                <th style={{ padding: '12px 14px' }}>
                  <Tooltip title="Confidence" description="Statistical probability percentage determined by the champion model." position="bottom">
                    <span style={{ cursor: 'help' }}>Confidence</span>
                  </Tooltip>
                </th>
                <th style={{ padding: '12px 14px' }}>
                  <Tooltip title="Primary Trigger" description="Top feature identified by SHAP that pushed the prediction into an alarm." position="bottom">
                    <span style={{ cursor: 'help' }}>Key Trigger</span>
                  </Tooltip>
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const badge = severityBadgeClass[alert.severity] || 'glass-badge-low';
                const timeStr = new Date(alert.timestamp).toLocaleTimeString();
                const primaryTrigger = alert.top_features?.[0]?.title || 'Network anomaly';

                return (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(6, 182, 212, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td style={{ padding: '14px' }}>
                      <span className={`glass-badge ${badge}`}>
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
                      <span style={{ color: '#67e8f9', fontWeight: 600 }}>{alert.src_ip}</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                      <span style={{ color: '#fda4af', fontWeight: 600 }}>{alert.dst_ip}</span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '50px', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${alert.confidence * 100}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #06b6d4, #38bdf8)', 
                            borderRadius: '4px',
                            boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)'
                          }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {(alert.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {primaryTrigger}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <Tooltip
                        title="Explain Attribution"
                        description="Opens the SHAP Explainability Drawer to view the AI executive summary and mathematical waterfall contribution of all 77 flow features."
                        badge="SHAP XAI"
                        position="top"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAlert(alert);
                          }}
                          className="liquid-btn liquid-btn-glass"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                        >
                          <Sparkles size={13} color="#06b6d4" />
                          Explain
                          <ChevronRight size={13} />
                        </button>
                      </Tooltip>
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
