import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Activity, 
  AlertOctagon, 
  Play, 
  Square, 
  RotateCcw, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  Zap,
  Layers,
  Database,
  FileText
} from 'lucide-react';

import MetricCard from './components/MetricCard';
import AttackDistributionChart from './components/AttackDistributionChart';
import AlertTable from './components/AlertTable';
import ExplainabilityDrawer from './components/ExplainabilityDrawer';
import ModelReportModal from './components/ModelReportModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [stats, setStats] = useState({
    total_flows: 0,
    total_attacks: 0,
    active_threats: 0,
    total_bytes: 0,
    bytes_formatted: '0 B',
  });
  const [distribution, setDistribution] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [simStatus, setSimStatus] = useState({ is_running: false, flows_streamed: 0 });
  const [replayRate, setReplayRate] = useState(2.0);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Polling data fetcher
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, distRes, alertsRes, simRes] = await Promise.all([
        fetch(`${API_BASE}/stats/overview`),
        fetch(`${API_BASE}/stats/distribution`),
        fetch(`${API_BASE}/alerts/recent?limit=50`),
        fetch(`${API_BASE}/simulate/status`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (distRes.ok) setDistribution(await distRes.json());
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
      if (simRes.ok) setSimStatus(await simRes.json());
      setIsConnected(true);
    } catch (err) {
      console.warn('Backend polling error:', err);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Simulator controls
  const handleToggleSimulation = async () => {
    setLoadingAction(true);
    try {
      if (simStatus.is_running) {
        await fetch(`${API_BASE}/simulate/stop`, { method: 'POST' });
      } else {
        await fetch(`${API_BASE}/simulate/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rate_hz: replayRate }),
        });
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Reset database
  const handleReset = async () => {
    if (window.confirm('Reset all network flow logs and alerts for a clean demo run?')) {
      try {
        await fetch(`${API_BASE}/reset`, { method: 'DELETE' });
        await fetchData();
      } catch (err) {
        console.error('Failed to reset:', err);
      }
    }
  };

  // Update alert status
  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts(prev => prev.map(a => (a.id === alertId ? updated : a)));
        if (selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert(updated);
        }
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '14px 28px',
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Logo & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
            }}>
              <Shield size={22} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  AI-NIDS
                </h1>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}>
                  XGBoost Core (99.8% F1)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Explainable Network Intrusion Detection & Threat Attribution System
              </span>
            </div>
          </div>

          {/* Action & Control Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Polling Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
            }}>
              <span className={`pulse-dot ${isConnected ? 'pulse-dot-active' : 'pulse-dot-inactive'}`} />
              <span style={{ color: isConnected ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                {isConnected ? 'Telemetry Live' : 'Connecting...'}
              </span>
            </div>

            {/* Model Evaluation Report Modal Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem' }}
            >
              <Cpu size={15} color="#06b6d4" />
              Model Benchmark
            </button>

            {/* Download PDF Guide Button */}
            <a
              href={`${API_BASE}/report/pdf`}
              download="AI_NIDS_Comprehensive_Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', textDecoration: 'none' }}
            >
              <FileText size={15} color="#38bdf8" />
              PDF Guide
            </a>

            {/* Replay Speed Selector */}
            <select
              value={replayRate}
              onChange={(e) => setReplayRate(parseFloat(e.target.value))}
              disabled={simStatus.is_running}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-secondary)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: simStatus.is_running ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="1.0" style={{ background: '#101727' }}>Speed: 1 flow/s</option>
              <option value="2.0" style={{ background: '#101727' }}>Speed: 2 flows/s</option>
              <option value="5.0" style={{ background: '#101727' }}>Speed: 5 flows/s</option>
              <option value="10.0" style={{ background: '#101727' }}>Speed: 10 flows/s</option>
            </select>

            {/* Traffic Replay Toggle Button */}
            <button
              onClick={handleToggleSimulation}
              disabled={loadingAction}
              className={`btn ${simStatus.is_running ? 'btn-danger' : 'btn-primary'}`}
              style={{ minWidth: '175px', justifyContent: 'center' }}
            >
              {simStatus.is_running ? (
                <>
                  <Square size={15} fill="currentColor" />
                  Stop Traffic Stream
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  Replay Live Traffic
                </>
              )}
            </button>

            {/* Purge / Reset */}
            <button
              onClick={handleReset}
              title="Purge recorded flows & alerts"
              className="btn btn-secondary"
              style={{ padding: '8px' }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', flex: 1, width: '100%' }}>
        {/* KPI Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <MetricCard
            title="Total Network Flows"
            value={stats.total_flows.toLocaleString()}
            subtext={`Cumulative: ${stats.bytes_formatted}`}
            icon={Layers}
            color="cyan"
            badge="Live Replay Stream"
          />

          <MetricCard
            title="Flagged Threats"
            value={stats.total_attacks.toLocaleString()}
            subtext={stats.total_flows > 0 ? `${((stats.total_attacks / stats.total_flows) * 100).toFixed(1)}% of total flows` : '0.0% incident rate'}
            icon={AlertOctagon}
            color="rose"
            badge="Threat Engine"
          />

          <MetricCard
            title="Active Threat Alerts"
            value={stats.active_threats.toLocaleString()}
            subtext="Requiring SOC Analyst review"
            icon={Activity}
            color="amber"
            badge="Needs Action"
          />

          <MetricCard
            title="Model Precision / FPR"
            value="0.20% FPR"
            subtext="99.83% Accuracy on held-out test"
            icon={CheckCircle2}
            color="emerald"
            badge="XGBoost + SHAP"
          />
        </div>

        {/* Analytics & Feed Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
        }}>
          {/* Main Column: Live Alerts Feed (7 cols on desktop) */}
          <div style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 8' } }} className="lg:col-span-8">
            <AlertTable
              alerts={alerts}
              onSelectAlert={(alert) => setSelectedAlert(alert)}
              onRefresh={fetchData}
            />
          </div>

          {/* Right Column: Threat Distribution & Engine Status (4 cols on desktop) */}
          <div style={{ gridColumn: 'span 12', '@media (min-width: 1024px)': { gridColumn: 'span 4' } }} className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AttackDistributionChart distribution={distribution} />

            {/* Real-time Stream Info Card */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Radio size={18} color="#34d399" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Telemetry Ingestion Status</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Simulation Stream:</span>
                  <span style={{ fontWeight: 600, color: simStatus.is_running ? '#34d399' : '#94a3b8' }}>
                    {simStatus.is_running ? 'STREAMING ACTIVE' : 'IDLE / READY'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Flows Emitted:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {simStatus.flows_streamed?.toLocaleString() || 0}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Threat Detection Engine:</span>
                  <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                    Real-time (TreeExplainer)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Database Persistence:</span>
                  <span style={{ fontWeight: 600, color: '#a78bfa' }}>
                    SQLite WAL Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SHAP Explainability Drawer */}
      <ExplainabilityDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Model Benchmark Report Modal */}
      <ModelReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '16px 28px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        AI-NIDS: Autonomous Network Intrusion Detection & Attribution • Powered by XGBoost, SHAP TreeExplainer, FastAPI, and React
      </footer>
    </div>
  );
}
