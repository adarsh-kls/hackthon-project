import React from 'react';
import { DetectedFileSummary } from '../../types/upload';

interface DocumentAlertProps {
  pendingUploads: DetectedFileSummary[];
  onInspectDocument: (file: DetectedFileSummary) => void;
}

export const DocumentAlert: React.FC<DocumentAlertProps> = ({ pendingUploads, onInspectDocument }) => {
  if (!pendingUploads || pendingUploads.length === 0) {
    return null;
  }

  const latestFile = pendingUploads[0];
  const sizeFormatted = (latestFile.fileSize / 1024).toFixed(1) + ' KB';

  return (
    <div
      style={{
        margin: '0 16px 12px 16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        border: '1px solid #3b82f6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '15px' }}>📁</span>
        <span style={{ fontWeight: 700, fontSize: '13px', color: '#60a5fa' }}>
          Document Upload Detected
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1c2541',
          padding: '8px 10px',
          borderRadius: '6px',
          marginBottom: '8px',
          border: '1px solid #3a506b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {latestFile.fileExtension}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#f8fafc',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '180px',
            }}
          >
            {latestFile.fileName}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sizeFormatted}</span>
      </div>

      <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
        Pre-upload inspection recommended: Prevent accidental data loss of PII, PAN, or secret keys.
      </p>

      <button
        onClick={() => onInspectDocument(latestFile)}
        style={{
          width: '100%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
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
        }}
      >
        <span>🛡️</span>
        <span>Inspect & Protect Document</span>
      </button>
    </div>
  );
};
