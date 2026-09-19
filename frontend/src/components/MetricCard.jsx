import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, color = 'cyan', badge }) {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/20 shadow-cyan-500/10',
    rose: 'text-rose-400 border-rose-500/20 shadow-rose-500/10',
    amber: 'text-amber-400 border-amber-500/20 shadow-amber-500/10',
    emerald: 'text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
    purple: 'text-purple-400 border-purple-500/20 shadow-purple-500/10',
  };

  const accentColor = {
    cyan: '#06b6d4',
    rose: '#f43f5e',
    amber: '#f59e0b',
    emerald: '#10b981',
    purple: '#a855f7',
  }[color] || '#06b6d4';

  return (
    <div 
      className="glass-panel glass-panel-hover"
      style={{
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: accentColor,
        boxShadow: `0 0 12px ${accentColor}`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
            {title}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {subtext}
            </div>
          )}
        </div>

        <div style={{
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {Icon && <Icon size={22} color={accentColor} />}
        </div>
      </div>

      {badge && (
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
