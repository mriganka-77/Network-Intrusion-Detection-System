import React from 'react';
import { ShieldAlert, BarChart3 } from 'lucide-react';

export default function AttackDistributionChart({ distribution = [] }) {
  const totalAttacks = distribution.reduce((sum, item) => sum + item.count, 0);

  const attackColors = {
    'DoS/DDoS': { bar: '#f43f5e', text: '#fda4af' },
    'Brute Force': { bar: '#f97316', text: '#fdba74' },
    'Port Scan': { bar: '#06b6d4', text: '#67e8f9' },
    'Botnet': { bar: '#a855f7', text: '#d8b4fe' },
    'Other': { bar: '#eab308', text: '#fde047' },
  };

  return (
    <div className="glass-panel" style={{ padding: '22px 26px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="#06b6d4" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Threat Classification Breakdown
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {totalAttacks} Total Incidents
        </span>
      </div>

      {distribution.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>
          <BarChart3 size={36} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '8px' }} />
          <span style={{ fontSize: '0.85rem' }}>No attacks detected in active stream</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
          {distribution.map((item) => {
            const pct = totalAttacks > 0 ? (item.count / totalAttacks) * 100 : 0;
            const theme = attackColors[item.attack_type] || { bar: '#06b6d4', text: '#67e8f9' };

            return (
              <div key={item.attack_type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.attack_type}
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {item.count.toLocaleString()} alerts
                    </span>
                    <span style={{ fontWeight: 700, color: theme.text, width: '45px', textAlign: 'right' }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(3, pct))}%`,
                    height: '100%',
                    backgroundColor: theme.bar,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease-out',
                    boxShadow: `0 0 8px ${theme.bar}88`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
