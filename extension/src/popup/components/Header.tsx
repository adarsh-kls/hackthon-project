import React from 'react';

interface HeaderProps {
  backendConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ backendConnected, onRefresh, isLoading }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#1c2541',
        borderBottom: '1px solid #3a506b',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>🛡️</span>
        <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px', color: '#6fffe9' }}>
          SENTINEL GUARD
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          title={backendConnected ? 'Backend Connected' : 'Standalone Local Mode (Heuristics)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: backendConnected ? '#10b981' : '#94a3b8',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '3px 8px',
            borderRadius: '12px',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: backendConnected ? '#10b981' : '#64748b',
              display: 'inline-block',
            }}
          />
          {backendConnected ? 'API Live' : 'Heuristics'}
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Re-scan page"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px',
          }}
        >
          🔄
        </button>
      </div>
    </div>
  );
};
