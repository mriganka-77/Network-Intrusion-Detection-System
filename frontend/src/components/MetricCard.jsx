import React from 'react';
import Tooltip from './Tooltip';

export default function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  color = 'cyan', 
  badge,
  tooltipTitle,
  tooltipDesc,
  tooltipDetails
}) {
  const accentColor = {
    cyan: '#06b6d4',
    rose: '#f43f5e',
    amber: '#f59e0b',
    emerald: '#10b981',
    purple: '#a855f7',
  }[color] || '#06b6d4';

  const cardContent = (
    <div 
      className="liquid-glass-card"
      style={{
        padding: '22px 26px',
        position: 'relative',
        cursor: 'help',
        width: '100%',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* 3D Liquid Accent Edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: `linear-gradient(180deg, ${accentColor}, rgba(99, 102, 241, 0.6))`,
        boxShadow: `0 0 16px ${accentColor}`,
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ 
            fontSize: '0.78rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            color: 'var(--text-muted)', 
            fontWeight: 700 
          }}>
            {title}
          </span>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            marginTop: '6px', 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            {value}
          </div>
        </div>

        <div style={{
          padding: '10px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `0 4px 14px ${accentColor}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {Icon && <Icon size={22} color={accentColor} />}
        </div>
      </div>

      {/* Bottom Subtext and Badge */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '12px', 
        paddingTop: '10px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.06)' 
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {subtext}
        </div>
        {badge && (
          <span className="glass-badge" style={{ borderColor: `${accentColor}44`, color: accentColor, background: `${accentColor}11` }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip
      title={tooltipTitle || title}
      description={tooltipDesc || subtext}
      details={tooltipDetails}
      badge="Metric Telemetry"
      position="bottom"
      maxWidth="320px"
    >
      {cardContent}
    </Tooltip>
  );
}
