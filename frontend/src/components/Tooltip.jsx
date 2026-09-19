import React from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({ 
  children, 
  title, 
  description, 
  details, 
  badge, 
  position = 'top',
  maxWidth = '290px'
}) {
  const positionClass = {
    top: '',
    bottom: 'tooltip-bottom',
    right: 'tooltip-right',
  }[position] || '';

  return (
    <div className={`tooltip-wrapper ${positionClass}`}>
      {children}
      
      <div 
        className="glass-tooltip" 
        style={{ maxWidth }}
      >
        {/* Tooltip Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Info size={13} color="#06b6d4" />
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f8fafc', letterSpacing: '-0.01em' }}>
              {title}
            </span>
          </div>

          {badge && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '6px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#67e8f9',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Primary Description */}
        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
          {description}
        </div>

        {/* Technical / System Impact Detail */}
        {details && (
          <div style={{
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontStyle: 'italic',
            lineHeight: '1.3'
          }}>
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
