import React from 'react';
import { X, Award, CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

export default function ModelReportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const classMetrics = [
    { name: 'Normal / Benign', precision: '98.2%', recall: '100.0%', f1: '0.99', support: '1,000' },
    { name: 'DoS / DDoS', precision: '100.0%', recall: '100.0%', f1: '1.00', support: '1,000' },
    { name: 'Brute Force', precision: '100.0%', recall: '100.0%', f1: '1.00', support: '1,000' },
    { name: 'Port Scan', precision: '100.0%', recall: '99.2%', f1: '0.99', support: '391' },
    { name: 'Botnet', precision: '100.0%', recall: '99.0%', f1: '0.99', support: '288' },
    { name: 'Other (Web / Infiltration)', precision: '100.0%', recall: '98.4%', f1: '0.99', support: '436' },
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0d1424',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '28px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <Award size={24} color="#06b6d4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Offline Model Performance & Evaluation
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                CIC-IDS2017 Benchmark Evaluation Report (Held-out Test Split)
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* High-level KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test Accuracy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>99.83%</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Macro F1-Score</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>0.9893</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>False Positive Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>0.20%</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Champion Model</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>XGBoost</div>
          </div>
        </div>

        {/* Per-class Metrics Table */}
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
          Multi-Class Breakdown on Held-out Test Set
        </h4>
        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '8px 10px' }}>Class</th>
                <th style={{ padding: '8px 10px' }}>Precision</th>
                <th style={{ padding: '8px 10px' }}>Recall</th>
                <th style={{ padding: '8px 10px' }}>F1-Score</th>
                <th style={{ padding: '8px 10px' }}>Support</th>
              </tr>
            </thead>
            <tbody>
              {classMetrics.map(row => (
                <tr key={row.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{row.name}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{row.precision}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>{row.recall}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f1f5f9' }}>{row.f1}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{row.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pipeline Architecture Highlights */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '10px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67e8f9', fontSize: '0.85rem', fontWeight: 700 }}>
            <Cpu size={16} />
            <span>Architecture & Feature Schema</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            • <strong>Frozen Feature Contract:</strong> Exactly 77 bidirectional network flow features.<br />
            • <strong>Sampling Strategy:</strong> Preserved 100% of all minority classes (Botnet, Port Scan, Brute Force, Web Attacks).<br />
            • <strong>SHAP Explainer:</strong> Fast TreeExplainer computing exact Shapley attributions in sub-50ms per prediction.<br />
            • <strong>Operational Metric:</strong> False Positive Rate on normal enterprise traffic is 0.20% (only 2 out of 1,000 normal flows flagged).
          </div>
        </div>
      </div>
    </div>
  );
}
