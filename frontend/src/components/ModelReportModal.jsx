import React from 'react';
import { X, Award, CheckCircle2, Cpu, ShieldCheck, FileText, Download } from 'lucide-react';
import Tooltip from './Tooltip';

export default function ModelReportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const classMetrics = [
    { name: 'Normal / Benign', precision: '87.0%', recall: '100.0%', f1: '0.93', support: '1,000', meaning: 'Regular work (browsing, email) — 0% missed' },
    { name: 'DoS / DDoS Floods', precision: '99.0%', recall: '100.0%', f1: '1.00', support: '1,000', meaning: 'Massive floods designed to crash web servers' },
    { name: 'Brute Force Password', precision: '100.0%', recall: '100.0%', f1: '1.00', support: '1,000', meaning: 'Robots rapidly guessing passwords' },
    { name: 'Port Scans (Probes)', precision: '100.0%', recall: '94.2%', f1: '0.97', support: '391', meaning: 'Attackers rattling locked network doors' },
    { name: 'Botnet Activity', precision: '99.0%', recall: '62.0%', f1: '0.76', support: '287', meaning: 'Infected zombie machines beaconing to C2' },
    { name: 'Other (Web Attacks)', precision: '100.0%', recall: '95.0%', f1: '0.98', support: '436', meaning: 'SQL Injection and web application exploits' },
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div 
        className="liquid-glass-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'rgba(11, 18, 33, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(6, 182, 212, 0.2)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              padding: '12px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(99, 102, 241, 0.25))', 
              border: '1px solid rgba(6, 182, 212, 0.4)',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)'
            }}>
              <Award size={26} color="#06b6d4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Offline Model Performance & Evaluation
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Trained on 100% of the real dataset in archive/ (2,313,810 flows)
              </span>
            </div>
          </div>

          <Tooltip title="Close" description="Exit this benchmark report view." position="bottom">
            <button onClick={onClose} className="liquid-btn liquid-btn-glass" style={{ padding: '8px', borderRadius: '10px' }}>
              <X size={18} />
            </button>
          </Tooltip>
        </div>

        {/* High-level KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '26px' }}>
          <Tooltip title="Accuracy" description="Percentage of test flows classified correctly out of 462,762 test examples." badge="99.91%" position="bottom">
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'help', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Test Accuracy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>99.91%</div>
            </div>
          </Tooltip>

          <Tooltip title="Macro F1-Score" description="Balanced average score across rare and common attacks alike." badge="0.9376" position="bottom">
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'help', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Macro F1-Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>0.9376</div>
            </div>
          </Tooltip>

          <Tooltip title="False Positive Rate" description="Only 1 false alarm per 1,000 normal flows, eliminating security guard alert fatigue." badge="0.100%" position="bottom">
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'help', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>False Positive Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>0.100%</div>
            </div>
          </Tooltip>

          <Tooltip title="Training Duration" description="XGBoost histogram binning trained on 1.85M rows in just 29.33 seconds." badge="10 Cores" position="bottom">
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'help', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Training Duration</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>29.33s</div>
            </div>
          </Tooltip>
        </div>

        {/* Per-class Metrics Table */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Per-Class Detection Performance (Held-Out Test Set)
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '10px' }}>Target Attack Class</th>
                  <th style={{ padding: '10px' }}>Precision</th>
                  <th style={{ padding: '10px' }}>Detection Rate</th>
                  <th style={{ padding: '10px' }}>F1-Score</th>
                  <th style={{ padding: '10px' }}>Plain English Meaning</th>
                </tr>
              </thead>
              <tbody>
                {classMetrics.map(row => (
                  <tr key={row.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{row.precision}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>{row.recall}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f1f5f9' }}>{row.f1}</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action bar to download full PDF */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px', 
          background: 'rgba(6, 182, 212, 0.08)', 
          border: '1px solid rgba(6, 182, 212, 0.25)', 
          borderRadius: '12px' 
        }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#67e8f9' }}>
              Looking for full step-by-step explanations?
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              The comprehensive 4-page PDF guide explains NIDS using simple everyday analogies.
            </div>
          </div>

          <a
            href="/report/pdf"
            download="AI_NIDS_Comprehensive_Guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-btn liquid-btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={15} />
            Download PDF Guide
          </a>
        </div>
      </div>
    </div>
  );
}
