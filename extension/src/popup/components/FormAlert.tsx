import React from 'react';
import { FormSecurityWarning } from '../../types/forms';

interface FormAlertProps {
  warnings: FormSecurityWarning[];
}

export const FormAlert: React.FC<FormAlertProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  // Deduplicate sensitive types across forms
  const allFields = warnings.flatMap((w) => w.sensitiveFields);
  if (allFields.length === 0) {
    return null;
  }

  const hasHttp = warnings.some((w) => w.isOverHttp);

  return (
    <div
      style={{
        margin: '0 16px 12px 16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: hasHttp ? 'rgba(239, 68, 68, 0.12)' : 'rgba(147, 51, 234, 0.12)',
        border: `1px solid ${hasHttp ? '#ef4444' : '#a855f7'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '15px' }}>{hasHttp ? '⚠️' : '📝'}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: '13px',
            color: hasHttp ? '#ef4444' : '#c084fc',
          }}
        >
          Sensitive Form Fields Detected
        </span>
      </div>

      <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '8px', lineHeight: '1.4' }}>
        This page contains input fields requesting confidential identity or financial information:
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {Array.from(new Set(allFields.map((f) => f.sensitiveType))).map((type) => (
          <span
            key={type}
            style={{
              backgroundColor: '#1c2541',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid #38bdf8',
            }}
          >
            {type}
          </span>
        ))}
      </div>

      <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
        🔒 Privacy Guarantee: SENTINEL analyzes DOM structure only and never reads, stores, or transmits your actual field values.
      </div>
    </div>
  );
};
