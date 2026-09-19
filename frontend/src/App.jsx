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
  FileText,
  HelpCircle,
  Clock,
  Settings
} from 'lucide-react';

import MetricCard from './components/MetricCard';
import AttackDistributionChart from './components/AttackDistributionChart';
import AlertTable from './components/AlertTable';
import ExplainabilityDrawer from './components/ExplainabilityDrawer';
import ModelReportModal from './components/ModelReportModal';
import Tooltip from './components/Tooltip';

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
      if (simRes.ok) {
        const simData = await simRes.json();
        setSimStatus(simData);
        if (simData.rate_hz && simData.is_running) {
          setReplayRate(Number(simData.rate_hz));
        }
      }
      setIsConnected(true);
    } catch (err) {
      console.warn('Backend polling error:', err);
      setIsConnected(false);
    }
  }, []);

  // Polling data fetcher with adaptive frequency based on replay speed
  useEffect(() => {
    fetchData();
    // Dynamic polling: fast polling when simulation is active at high rate
    let pollInterval = 1200;
    if (simStatus.is_running) {
      if (replayRate >= 25) pollInterval = 250;
      else if (replayRate >= 10) pollInterval = 400;
      else if (replayRate >= 5) pollInterval = 600;
      else if (replayRate >= 2) pollInterval = 800;
      else pollInterval = 1000;
    }
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, simStatus.is_running, replayRate]);

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
          body: JSON.stringify({ rate_hz: Number(replayRate) }),
        });
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Dynamic speed adjustment on the fly
  const handleSpeedChange = async (newRate) => {
    const rateVal = Number(newRate);
    setReplayRate(rateVal);
    if (simStatus.is_running) {
      try {
        const res = await fetch(`${API_BASE}/simulate/speed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rate_hz: rateVal }),
        });
        if (res.ok) {
          const updated = await res.json();
          setSimStatus(prev => ({ ...prev, delay_seconds: updated.delay_seconds, rate_hz: updated.rate_hz }));
        }
        await fetchData();
      } catch (err) {
        console.error('Failed to dynamically update speed:', err);
      }
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 3D Animated Liquid Ambient Background */}
      <div className="liquid-canvas">
        <div className="liquid-orb orb-1" />
        <div className="liquid-orb orb-2" />
        <div className="liquid-orb orb-3" />
      </div>

      {/* Top Glass Navigation Bar */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(6, 9, 19, 0.75)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 32px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
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
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
            }}>
              <Shield size={24} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  AI-NIDS
                </h1>
                <Tooltip
                  title="Champion ML Core"
                  description="XGBoost multi-class classifier trained on 2,313,810 real network records across 77 features."
                  badge="99.91% Accuracy"
                  position="bottom"
                >
                  <span className="glass-badge glass-badge-low" style={{ cursor: 'help' }}>
                    XGBoost Core (99.9% Acc)
                  </span>
                </Tooltip>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                3D Explainable Network Intrusion Detection & Attribution System
              </span>
            </div>
          </div>

          {/* Action & Control Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Telemetry Status Pill */}
            <Tooltip
              title="Live Connection Status"
              description="Indicates whether the dashboard frontend is successfully receiving real-time telemetry from the FastAPI backend."
              details="Automatic polling interval: 1.5 seconds."
              position="bottom"
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.75rem',
                cursor: 'help',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#10b981' : '#64748b',
                  boxShadow: isConnected ? '0 0 12px #10b981' : 'none',
                  display: 'inline-block',
                }} />
                <span style={{ color: isConnected ? '#34d399' : '#94a3b8', fontWeight: 700 }}>
                  {isConnected ? 'Telemetry Live' : 'Connecting...'}
                </span>
              </div>
            </Tooltip>

            {/* Model Benchmark Report Button */}
            <Tooltip
              title="View Model Benchmark"
              description="Opens the comprehensive model comparison and multi-class test evaluation metrics."
              details="Shows Accuracy, Macro F1, Recall, Precision, and the Confusion Matrix."
              position="bottom"
            >
              <button
                onClick={() => setIsReportOpen(true)}
                className="liquid-btn liquid-btn-glass"
                style={{ fontSize: '0.8rem' }}
              >
                <Cpu size={15} color="#06b6d4" />
                Benchmark
              </button>
            </Tooltip>

            {/* Download PDF Guide Button */}
            <Tooltip
              title="Download PDF Project Guide"
              description="Downloads the 4-page beginner-friendly publication PDF explaining NIDS using simple real-world analogies."
              details="Accessible for non-IT and technical readers alike."
              position="bottom"
            >
              <a
                href={`${API_BASE}/report/pdf`}
                download="AI_NIDS_Comprehensive_Guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-btn liquid-btn-glass"
                style={{ fontSize: '0.8rem', textDecoration: 'none' }}
              >
                <FileText size={15} color="#38bdf8" />
                PDF Guide
              </a>
            </Tooltip>

            {/* Replay Speed Selector */}
            <Tooltip
              title="Stream Rate Adjustment (On-the-fly)"
              description="Dynamically changes how fast simulated network flows are ingested and evaluated."
              details="You can change speed anytime while the stream is actively running! Speeds up to 50 flows/sec."
              position="bottom"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  id="replay-speed-select"
                  value={replayRate}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    color: '#67e8f9',
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(6, 182, 212, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <option value={1} style={{ background: '#101727', color: '#f8fafc' }}>1x: 1 flow/sec (Relaxed)</option>
                  <option value={2} style={{ background: '#101727', color: '#f8fafc' }}>2x: 2 flows/sec (Standard)</option>
                  <option value={5} style={{ background: '#101727', color: '#f8fafc' }}>5x: 5 flows/sec (Fast)</option>
                  <option value={10} style={{ background: '#101727', color: '#f8fafc' }}>10x: 10 flows/sec (Turbo)</option>
                  <option value={25} style={{ background: '#101727', color: '#f8fafc' }}>25x: 25 flows/sec (Ultra)</option>
                  <option value={50} style={{ background: '#101727', color: '#f8fafc' }}>50x: 50 flows/sec (Maximum)</option>
                </select>

                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: simStatus.is_running ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: simStatus.is_running ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: simStatus.is_running ? '#22d3ee' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Zap size={13} color={simStatus.is_running ? '#22d3ee' : '#94a3b8'} />
                  <span>{replayRate}x ({replayRate} f/s)</span>
                </div>
              </div>
            </Tooltip>

            {/* Traffic Replay Toggle Button */}
            <Tooltip
              title={simStatus.is_running ? "Stop Traffic Replay" : "Start Live Traffic Replay"}
              description={simStatus.is_running 
                ? "Stops the background simulation thread and pauses incoming flow ingestion."
                : "Starts streaming real network flows through the XGBoost ML model and SHAP attribution engine in real-time."}
              badge={simStatus.is_running ? "Live Active" : "1-Click Demo"}
              position="bottom"
            >
              <button
                onClick={handleToggleSimulation}
                disabled={loadingAction}
                className={`liquid-btn ${simStatus.is_running ? 'liquid-btn-danger' : 'liquid-btn-primary'}`}
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
            </Tooltip>

            {/* Reset / Purge Database Button */}
            <Tooltip
              title="Purge Recorded Telemetry"
              description="Clears all recorded flows and alerts from the SQLite database to reset the dashboard for a fresh demonstration."
              badge="Data Reset"
              position="bottom"
            >
              <button
                onClick={handleReset}
                className="liquid-btn liquid-btn-glass"
                style={{ padding: '8px', borderRadius: '10px' }}
              >
                <RotateCcw size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '28px 32px', 
        flex: 1, 
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* KPI Cards Row with Explanatory Tooltips */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          <MetricCard
            title="Total Network Flows"
            value={stats.total_flows.toLocaleString()}
            subtext={`Cumulative: ${stats.bytes_formatted}`}
            icon={Layers}
            color="cyan"
            badge="Live Sensor"
            tooltipTitle="Total Network Flows"
            tooltipDesc="The cumulative count of bidirectional network conversations analyzed by AI-NIDS in this session."
            tooltipDetails="Includes both normal office traffic and identified cyber threats."
          />

          <MetricCard
            title="Flagged Threats"
            value={stats.total_attacks.toLocaleString()}
            subtext={stats.total_flows > 0 ? `${((stats.total_attacks / stats.total_flows) * 100).toFixed(1)}% of total flows` : '0.0% incident rate'}
            icon={AlertOctagon}
            color="rose"
            badge="Threat Engine"
            tooltipTitle="Flagged Malicious Threats"
            tooltipDesc="The total number of network flows identified as cyberattacks by the XGBoost algorithm with confidence > 75%."
            tooltipDetails="Classified into DoS/DDoS, Brute Force, Port Scans, Botnets, and Web Exploits."
          />

          <MetricCard
            title="Active Threat Alerts"
            value={stats.active_threats.toLocaleString()}
            subtext="Requiring SOC Analyst review"
            icon={Activity}
            color="amber"
            badge="Needs Action"
            tooltipTitle="Active Alerts Awaiting Triage"
            tooltipDesc="Alerts in 'New' status that have not yet been reviewed, acknowledged, or dismissed by human security guards."
            tooltipDetails="Security analysts click 'Explain' to inspect the SHAP AI rationale."
          />

          <MetricCard
            title="Operational False Positive Rate"
            value="0.100% FPR"
            subtext="Only 1 false alarm per 1,000 normal flows"
            icon={CheckCircle2}
            color="emerald"
            badge="99.91% Accuracy"
            tooltipTitle="Operational False Positive Rate (FPR)"
            tooltipDesc="Measures how often normal office traffic is mistakenly flagged as an attack."
            tooltipDetails="Our 0.10% FPR eliminates guard fatigue, ensuring analysts trust every triggered alarm."
          />
        </div>

        {/* Analytics & Feed Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
        }}>
          {/* Main Column: Live Alerts Feed (8 cols on desktop) */}
          <div style={{ gridColumn: 'span 12' }} className="lg:col-span-8">
            <AlertTable
              alerts={alerts}
              onSelectAlert={(alert) => setSelectedAlert(alert)}
              onRefresh={fetchData}
            />
          </div>

          {/* Right Column: Threat Distribution & Engine Status (4 cols on desktop) */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }} className="lg:col-span-4">
            <AttackDistributionChart distribution={distribution} />

            {/* Real-time Stream Info Card */}
            <div className="liquid-glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}>
                  <Radio size={18} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    System Status & Telemetry
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Active pipeline components
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
                <Tooltip
                  title="Simulation State"
                  description="Current operational status of the background traffic replay worker."
                  position="left"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'help', width: '100%' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Simulation Stream:</span>
                    <span style={{ fontWeight: 700, color: simStatus.is_running ? '#34d399' : '#94a3b8' }}>
                      {simStatus.is_running ? '● STREAMING ACTIVE' : '○ IDLE / READY'}
                    </span>
                  </div>
                </Tooltip>

                <Tooltip
                  title="Flows Ingested"
                  description="Number of network flows injected from the test sample into the threat pipeline."
                  position="left"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'help', width: '100%' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Flows Analyzed:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                      {simStatus.flows_streamed?.toLocaleString() || 0}
                    </span>
                  </div>
                </Tooltip>

                <Tooltip
                  title="Replay Throughput Rate"
                  description="Real-time frequency of simulated network flows ingested and analyzed per second."
                  position="left"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'help', width: '100%' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Throughput Rate:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: simStatus.is_running ? '#38bdf8' : '#94a3b8' }}>
                      {simStatus.is_running ? `⚡ ${replayRate} flows/s (${replayRate}x)` : '0 flows/s (Idle)'}
                    </span>
                  </div>
                </Tooltip>

                <Tooltip
                  title="XAI Engine"
                  description="SHAP TreeExplainer pre-loaded in memory for real-time Shapley mathematical feature attribution."
                  position="left"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'help', width: '100%' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Explainability:</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                      SHAP TreeExplainer (&lt;50ms)
                    </span>
                  </div>
                </Tooltip>

                <Tooltip
                  title="Storage Engine"
                  description="Embedded SQLite database with Write-Ahead Logging (WAL) mode for low-latency concurrent flow logging."
                  position="left"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'help', width: '100%' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Persistence:</span>
                    <span style={{ fontWeight: 700, color: '#a78bfa' }}>
                      SQLite (WAL Mode)
                    </span>
                  </div>
                </Tooltip>
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

      {/* Liquid Glass Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(6, 9, 19, 0.65)',
        backdropFilter: 'blur(16px)',
        padding: '18px 32px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        position: 'relative',
        zIndex: 1,
      }}>
        AI-NIDS: 3D Animated Liquid Glass Intrusion Detection & Attribution • Powered by XGBoost, SHAP, FastAPI & React
      </footer>
    </div>
  );
}
