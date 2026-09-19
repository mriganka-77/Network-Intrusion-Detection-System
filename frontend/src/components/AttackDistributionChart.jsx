import React from 'react';
import { ShieldAlert, BarChart3, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

export default function AttackDistributionChart({ distribution = [] }) {
  const totalAttacks = distribution.reduce((sum, item) => sum + item.count, 0);

  const attackMeta = {
    'DoS/DDoS': { 
      bar: 'linear-gradient(90deg, #f43f5e, #fb7185)', 
      shadow: '#f43f5e', 
      text: '#fda4af',
      desc: 'Denial of Service floods: Overwhelms target with traffic to knock it offline.',
      detail: 'Includes DoS Hulk, Slowhttptest, GoldenEye, and volumetric DDoS.'
    },
    'Brute Force': { 
      bar: 'linear-gradient(90deg, #f97316, #fb923c)', 
      shadow: '#f97316', 
      text: '#fdba74',
      desc: 'Automated rapid password guessing on network login services.',
      detail: 'Targets FTP-Patator, SSH-Patator, and web login endpoints.'
    },
    'Port Scan': { 
      bar: 'linear-gradient(90deg, #06b6d4, #38bdf8)', 
      shadow: '#06b6d4', 
      text: '#67e8f9',
      desc: 'Reconnaissance scans probing for open and vulnerable doors.',
      detail: 'Rapid sequential SYN packets tested against multiple server ports.'
    },
    'Botnet': { 
      bar: 'linear-gradient(90deg, #a855f7, #c084fc)', 
      shadow: '#a855f7', 
      text: '#d8b4fe',
      desc: 'Infected zombie computers communicating with external criminal command servers.',
      detail: 'Ares Botnet Command & Control (C2) channel beaconing.'
    },
    'Other': { 
      bar: 'linear-gradient(90deg, #eab308, #fde047)', 
      shadow: '#eab308', 
      text: '#fde047',
      desc: 'Web application exploits and internal infiltration attempts.',
      detail: 'Cross-Site Scripting (XSS), SQL Injection, and privilege escalation.'
    },
  };

  return (
    <div className="liquid-glass-card" style={{ padding: '24px 26px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.25)',
          }}>
            <ShieldAlert size={18} color="#06b6d4" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Threat Classification Breakdown
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time classification distribution
            </span>
          </div>
        </div>

        <Tooltip
          title="Incident Counter"
          description="Total count of malicious traffic flows identified by the ML model in the current session."
          position="bottom"
        >
          <span className="glass-badge" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', cursor: 'help' }}>
            {totalAttacks} Incidents
          </span>
        </Tooltip>
      </div>

      {/* Content */}
      {distribution.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '36px 0' }}>
          <BarChart3 size={40} strokeWidth={1.5} style={{ opacity: 0.35, marginBottom: '10px' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No attacks detected in active stream</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Start the traffic replay stream to see live classification.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
          {distribution.map((item) => {
            const pct = totalAttacks > 0 ? (item.count / totalAttacks) * 100 : 0;
            const meta = attackMeta[item.attack_type] || {
              bar: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
              shadow: '#06b6d4',
              text: '#67e8f9',
              desc: 'Suspicious network anomaly detected.',
              detail: 'Flow attributes deviating from baseline.'
            };

            return (
              <Tooltip
                key={item.attack_type}
                title={item.attack_type}
                description={meta.desc}
                details={meta.detail}
                badge={`${pct.toFixed(1)}% Share`}
                position="right"
                maxWidth="300px"
              >
                <div style={{ cursor: 'help', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.attack_type}
                      </span>
                      <HelpCircle size={12} color="var(--text-muted)" />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {item.count.toLocaleString()} alerts
                      </span>
                      <span style={{ fontWeight: 800, color: meta.text, width: '45px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 3D Liquid Bar */}
                  <div style={{
                    width: '100%',
                    height: '9px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
                  }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(4, pct))}%`,
                      height: '100%',
                      background: meta.bar,
                      borderRadius: '6px',
                      transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: `0 0 14px ${meta.shadow}88, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                    }} />
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}
