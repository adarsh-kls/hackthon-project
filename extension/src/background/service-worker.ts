import { evaluateWebsiteSecurity } from '../services/security-check';
import { ExtensionMessage, TabSecurityState } from '../types/messages';
import { SecurityReport } from '../types/security';
import { FormSecurityWarning } from '../types/forms';
import { DetectedFileSummary } from '../types/upload';
import { sentinelApi } from '../services/api';

// In-memory tab security cache
const tabStates = new Map<number, TabSecurityState>();

/**
 * Updates extension action badge and title based on security report.
 */
function updateBadge(tabId: number, report: SecurityReport): void {
  let badgeText = '';
  let badgeColor = '#10b981'; // Green
  let title = `SENTINEL GUARD: Safe (${report.domain})`;

  if (report.level === 'DANGEROUS') {
    badgeText = '!';
    badgeColor = '#ef4444'; // Red
    title = `SENTINEL GUARD: DANGEROUS WEBSITE (${report.indicators[0]?.title || 'Threat Detected'})`;
  } else if (report.level === 'SUSPICIOUS') {
    badgeText = '?';
    badgeColor = '#f59e0b'; // Amber
    title = `SENTINEL GUARD: Suspicious Indicators Found (${report.domain})`;
  } else {
    badgeText = '✓';
    badgeColor = '#10b981';
  }

  chrome.action.setBadgeText({ tabId, text: badgeText });
  chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColor });
  chrome.action.setTitle({ tabId, title });
}

/**
 * Assesses tab URL and creates or updates its security state.
 */
function evaluateTab(tabId: number, url: string): TabSecurityState {
  const report = evaluateWebsiteSecurity(url);
  updateBadge(tabId, report);

  const existingState = tabStates.get(tabId);
  const state: TabSecurityState = {
    tabId,
    url,
    domain: report.domain,
    securityReport: report,
    formWarnings: existingState?.formWarnings || [],
    pendingUploads: existingState?.pendingUploads || [],
    backendConnected: sentinelApi.isBackendOnline(),
    updatedAt: Date.now(),
  };

  tabStates.set(tabId, state);

  // If dangerous, trigger notification once
  if (report.level === 'DANGEROUS' && report.indicators.some((i) => i.severity === 'critical')) {
    chrome.notifications.create(`threat-${tabId}-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'SENTINEL GUARD: Threat Detected',
      message: `Warning: "${report.domain}" has strong threat indicators. Avoid entering credentials or personal IDs.`,
      priority: 2,
    });
  }

  return state;
}

// 1. Navigation Event Listeners
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || (changeInfo.status === 'complete' && tab.url)) {
    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      evaluateTab(tabId, tab.url);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});

// 2. Navigation & Redirect Monitoring via webNavigation
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0 && details.url) {
    const isRedirect =
      details.transitionQualifiers &&
      (details.transitionQualifiers.includes('server_redirect') ||
        details.transitionQualifiers.includes('client_redirect'));

    if (isRedirect) {
      const state = tabStates.get(details.tabId);
      if (state) {
        try {
          const destHost = new URL(details.url).hostname;
          if (state.domain && state.domain !== destHost) {
            state.securityReport.indicators.push({
              id: `redirect-${Date.now()}`,
              category: 'SUSPICIOUS_REDIRECT',
              severity: 'medium',
              title: 'Cross-Domain Redirect Detected',
              description: `Navigation involved a cross-domain redirect to "${destHost}".`,
              timestamp: Date.now(),
            });
          }
        } catch {
          // ignore malformed URLs
        }
      }
    }
  }
});

// 3. Runtime Message Dispatcher
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage<unknown>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    const tabId = sender.tab?.id || message.tabId;

    switch (message.type) {
      case 'URL_SECURITY_REPORT': {
        const report = message.payload as SecurityReport;
        if (tabId) {
          updateBadge(tabId, report);
          const state = tabStates.get(tabId) || {
            tabId,
            url: report.url,
            domain: report.domain,
            securityReport: report,
            formWarnings: [],
            pendingUploads: [],
            backendConnected: sentinelApi.isBackendOnline(),
            updatedAt: Date.now(),
          };
          state.securityReport = report;
          tabStates.set(tabId, state);
        }
        sendResponse({ success: true });
        break;
      }

      case 'FORM_SENSITIVITY_EVENT': {
        const warnings = message.payload as FormSecurityWarning[];
        if (tabId) {
          const state = tabStates.get(tabId);
          if (state) {
            state.formWarnings = warnings;
          }
        }
        sendResponse({ success: true });
        break;
      }

      case 'FILE_UPLOAD_INTERCEPTED': {
        const fileInfo = message.payload as DetectedFileSummary;
        if (tabId) {
          const state = tabStates.get(tabId);
          if (state) {
            // Avoid duplicate file entries
            const exists = state.pendingUploads.some(
              (f) => f.fileName === fileInfo.fileName && f.fileSize === fileInfo.fileSize
            );
            if (!exists) {
              state.pendingUploads.unshift(fileInfo);
            }
          }
        }
        sendResponse({ success: true });
        break;
      }

      case 'GET_ACTIVE_TAB_DATA': {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const activeTab = tabs[0];
          if (!activeTab || !activeTab.id || !activeTab.url) {
            sendResponse(null);
            return;
          }

          let state = tabStates.get(activeTab.id);
          if (!state) {
            state = evaluateTab(activeTab.id, activeTab.url);
          }

          // Check backend status in parallel
          const health = await sentinelApi.checkHealth(1500);
          state.backendConnected = health.status === 'ok';

          sendResponse(state);
        });
        return true; // Keep message channel open for async response
      }

      case 'OPEN_SENTINEL_DASHBOARD': {
        const payload = message.payload as { url?: string };
        const target = payload?.url || sentinelApi.getBaseUrl();
        chrome.tabs.create({ url: target });
        sendResponse({ success: true });
        break;
      }

      case 'CHECK_BACKEND_HEALTH': {
        sentinelApi.checkHealth().then((health) => {
          sendResponse(health);
        });
        return true;
      }

      default:
        sendResponse({ error: 'Unknown message type' });
        break;
    }

    return true;
  }
);

// Initial health check on worker startup
sentinelApi.checkHealth().catch(() => {});
