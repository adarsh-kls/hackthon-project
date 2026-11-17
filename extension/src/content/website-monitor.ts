import { evaluateWebsiteSecurity } from '../services/security-check';
import { SecurityReport } from '../types/security';
import { ExtensionMessage } from '../types/messages';

export class WebsiteMonitor {
  private currentReport: SecurityReport | null = null;
  private badgeElement: HTMLElement | null = null;

  public init(): void {
    this.evaluateCurrentPage();
    this.setupNavigationListeners();
  }

  public evaluateCurrentPage(): SecurityReport {
    const url = window.location.href;
    const report = evaluateWebsiteSecurity(url);
    this.currentReport = report;

    // Report to background service worker
    this.sendReportToBackground(report);

    // Update in-page UI badge if appropriate
    this.renderInPageBadge(report);

    return report;
  }

  public getCurrentReport(): SecurityReport | null {
    return this.currentReport;
  }

  private setupNavigationListeners(): void {
    // Listen to Single-Page Application (SPA) URL changes
    window.addEventListener('popstate', () => this.evaluateCurrentPage());

    // Intercept pushState & replaceState
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.evaluateCurrentPage();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.evaluateCurrentPage();
    };
  }

  private sendReportToBackground(report: SecurityReport): void {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      const message: ExtensionMessage<SecurityReport> = {
        type: 'URL_SECURITY_REPORT',
        payload: report,
      };
      chrome.runtime.sendMessage(message).catch(() => {
        // Background worker might be idle or asleep
      });
    }
  }

  public renderInPageBadge(report: SecurityReport): void {
    // Don't inject on local development or if badge already exists
    if (report.level === 'SAFE' && !report.indicators.length) {
      if (this.badgeElement) {
        this.badgeElement.remove();
        this.badgeElement = null;
      }
      return;
    }

    if (!this.badgeElement) {
      this.badgeElement = document.createElement('div');
      this.badgeElement.id = 'sentinel-guard-page-badge';
      document.body.appendChild(this.badgeElement);
    }

    const isDangerous = report.level === 'DANGEROUS';
    const bgColor = isDangerous ? '#ef4444' : '#f59e0b';
    const icon = isDangerous ? '⚠️' : '🛡️';
    const title = isDangerous ? 'SENTINEL: Dangerous Website Warning' : 'SENTINEL: Suspicious Indicators';

    this.badgeElement.innerHTML = `
      <style>
        #sentinel-guard-page-badge {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 2147483647;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid ${bgColor};
          border-left: 4px solid ${bgColor};
          border-radius: 8px;
          padding: 10px 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          max-width: 320px;
          line-height: 1.4;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        #sentinel-guard-page-badge .sentinel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          color: ${bgColor};
        }
        #sentinel-guard-page-badge .sentinel-desc {
          color: #94a3b8;
          font-size: 11px;
        }
        #sentinel-guard-page-badge .sentinel-close {
          cursor: pointer;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 14px;
          padding: 0 4px;
        }
        #sentinel-guard-page-badge .sentinel-close:hover {
          color: #ffffff;
        }
      </style>
      <div class="sentinel-header">
        <span>${icon} ${title}</span>
        <button class="sentinel-close" id="sentinel-badge-dismiss">✕</button>
      </div>
      <div class="sentinel-desc">
        ${report.indicators[0]?.description || report.warningsExplanation || 'Review security status in extension toolbar.'}
      </div>
    `;

    const dismissBtn = this.badgeElement.querySelector('#sentinel-badge-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (this.badgeElement) {
          this.badgeElement.remove();
          this.badgeElement = null;
        }
      });
    }
  }
}
