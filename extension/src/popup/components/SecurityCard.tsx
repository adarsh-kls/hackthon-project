import React from 'react';
import { SecurityReport } from '../../types/security';

interface SecurityCardProps {
  report: SecurityReport;
  onScanDocument: () => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({ report, onScanDocument }) => {
  const isSafe = report.level === 'SAFE';
  const isSuspicious = report.level === 'SUSPICIOUS';
  const isDangerous = report.level === 'DANGEROUS';

  const badgeColor = isDangerous ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';
  const badgeBg = isDangerous ? 'rgba(239, 68, 68, 0.15)' : isSuspicious ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  const statusIcon = isDangerous ? '🛑' : isSuspicious ? '⚠️' : '✅';

  return (
    <div
      style={{
        backgroundColor: '#1c2541',
        borderRadius: '10px',
        padding: '14px',
        margin: '12px 16px',
        border: `1px solid ${isSafe ? '#3a506b' : badgeColor}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Website
          </span>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#f8fafc',
              wordBreak: 'break-all',
              marginTop: '2px',
            }}
          >
            {report.domain}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: badgeBg,
            color: badgeColor,
            fontWeight: 700,
            fontSize: '12px',
            border: `1px solid ${badgeColor}`,
          }}
        >
          <span>{statusIcon}</span>
          <span>{report.level}</span>
        </div>
      </div>

      {/* Protocol indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: report.protocol === 'https:' ? '#10b981' : '#f59e0b',
          margin: '8px 0',
        }}
      >
        <span>{report.protocol === 'https:' ? '🔒 Encrypted (HTTPS)' : '🔓 Unencrypted (HTTP)'}</span>
        <span style={{ color: '#475569' }}>•</span>
        <span style={{ color: '#94a3b8' }}>Risk Score: {report.score}/100</span>
      </div>

      {/* Action button */}
      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #3a506b' }}>
        <button
          onClick={onScanDocument}
          style={{
            width: '100%',
            backgroundColor: '#3a506b',
            color: '#6fffe9',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#4d6a8f')}
          onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#3a506b')}
        >
          <span>📄</span>
          <span>Scan a Document in SENTINEL</span>
        </button>
      </div>
    </div>
  );
};
