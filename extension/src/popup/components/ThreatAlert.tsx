import React from 'react';
import { SecurityReport } from '../../types/security';

interface ThreatAlertProps {
  report: SecurityReport;
}

export const ThreatAlert: React.FC<ThreatAlertProps> = ({ report }) => {
  if (report.level === 'SAFE' && report.indicators.length === 0) {
    return null;
  }

  const isDangerous = report.level === 'DANGEROUS';
  const alertColor = isDangerous ? '#ef4444' : '#f59e0b';
  const alertBg = isDangerous ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)';

  return (
    <div
      style={{
        margin: '0 16px 12px 16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: alertBg,
        border: `1px solid ${alertColor}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '15px' }}>{isDangerous ? '🚨' : '⚠️'}</span>
        <span style={{ fontWeight: 700, fontSize: '13px', color: alertColor }}>
          {isDangerous ? 'High Threat Warning' : 'Suspicious Website Signals'}
        </span>
      </div>

      <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
        {report.warningsExplanation}
      </p>

      {/* List of triggered heuristics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {report.indicators.map((indicator) => (
          <div
            key={indicator.id}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '8px 10px',
              borderRadius: '6px',
              borderLeft: `3px solid ${indicator.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '12px', color: '#f8fafc' }}>{indicator.title}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: '1.3' }}>
              {indicator.description}
            </div>
            {indicator.recommendation && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#6fffe9',
                  marginTop: '4px',
                  fontWeight: 500,
                }}
              >
                💡 Recommendation: {indicator.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
