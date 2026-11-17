import React, { useEffect, useState } from 'react';
import { TabSecurityState } from '../types/messages';
import { DetectedFileSummary } from '../types/upload';
import { DEFAULT_CONFIG } from '../utils/constants';
import { Header } from './components/Header';
import { SecurityCard } from './components/SecurityCard';
import { ThreatAlert } from './components/ThreatAlert';
import { DocumentAlert } from './components/DocumentAlert';
import { FormAlert } from './components/FormAlert';

export const App: React.FC = () => {
  const [tabState, setTabState] = useState<TabSecurityState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTabState = () => {
    setIsLoading(true);
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_DATA' }, (response: TabSecurityState | null) => {
        setTabState(response);
        setIsLoading(false);
      });
    } else {
      // Development mock state
      setTimeout(() => {
        setTabState({
          tabId: 1,
          url: 'https://example.com/checkout',
          domain: 'example.com',
          securityReport: {
            url: 'https://example.com/checkout',
            domain: 'example.com',
            protocol: 'https:',
            level: 'SAFE',
            score: 0,
            indicators: [],
            assessedAt: new Date().toISOString(),
          },
          formWarnings: [],
          pendingUploads: [],
          backendConnected: false,
          updatedAt: Date.now(),
        });
        setIsLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchTabState();
  }, []);

  const handleScanDocument = () => {
    const uploadUrl = `${DEFAULT_CONFIG.FRONTEND_APP_URL}/upload`;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: uploadUrl });
    } else {
      window.open(uploadUrl, '_blank');
    }
  };

  const handleInspectDocument = (file: DetectedFileSummary) => {
    const uploadUrl = `${DEFAULT_CONFIG.FRONTEND_APP_URL}/upload?fileName=${encodeURIComponent(
      file.fileName
    )}&fileType=${file.fileExtension}`;

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: uploadUrl });
    } else {
      window.open(uploadUrl, '_blank');
    }
  };

  return (
    <div style={{ minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
      <Header
        backendConnected={tabState?.backendConnected || false}
        onRefresh={fetchTabState}
        isLoading={isLoading}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading && !tabState ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '13px',
            }}
          >
            Evaluating website security posture...
          </div>
        ) : tabState ? (
          <>
            {/* Primary State 1: Security Card */}
            <SecurityCard report={tabState.securityReport} onScanDocument={handleScanDocument} />

            {/* Primary State 3: Document Selected View */}
            <DocumentAlert
              pendingUploads={tabState.pendingUploads}
              onInspectDocument={handleInspectDocument}
            />

            {/* Primary State 2: Threat Warning View */}
            <ThreatAlert report={tabState.securityReport} />

            {/* Sensitive Form Fields Alert */}
            <FormAlert warnings={tabState.formWarnings} />
          </>
        ) : (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '13px',
            }}
          >
            No active web tab detected.
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: '#0b132b',
          borderTop: '1px solid #1c2541',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#64748b',
        }}
      >
        <span>SENTINEL GUARD v0.1.0</span>
        <span>Zero-Data Retention Policy</span>
      </div>
    </div>
  );
};

export default App;
