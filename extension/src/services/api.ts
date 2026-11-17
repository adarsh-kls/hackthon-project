import { DEFAULT_CONFIG } from '../utils/constants';

export interface HealthCheckResponse {
  status: 'ok' | 'error' | 'unavailable';
  details?: string;
}

export interface BackendUrlAnalysisResponse {
  url: string;
  isThreat: boolean;
  score?: number;
  threatDetails?: string;
}

/**
 * Service to handle communication with the SENTINEL FastAPI Backend.
 * Designed to degrade gracefully if the backend is unreachable or offline.
 */
class SentinelApiService {
  private apiBaseUrl: string = DEFAULT_CONFIG.BACKEND_API_BASE;
  private isOnline: boolean = false;

  constructor() {
    this.initSettings();
  }

  private async initSettings(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['sentinelBackendUrl'], (result) => {
        if (result.sentinelBackendUrl) {
          this.apiBaseUrl = result.sentinelBackendUrl;
        }
      });
    }
  }

  public setBaseUrl(url: string): void {
    this.apiBaseUrl = url.replace(/\/+$/, '');
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ sentinelBackendUrl: this.apiBaseUrl });
    }
  }

  public getBaseUrl(): string {
    return this.apiBaseUrl;
  }

  public isBackendOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Probes /api/v1/health to verify connectivity with the FastAPI backend.
   */
  public async checkHealth(timeoutMs = 3000): Promise<HealthCheckResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isOnline = data.status === 'ok';
        return { status: 'ok' };
      } else {
        this.isOnline = false;
        return { status: 'error', details: `HTTP Status ${response.status}` };
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      this.isOnline = false;
      const message = err instanceof Error ? err.message : 'Connection failed';
      return { status: 'unavailable', details: message };
    }
  }

  /**
   * Optionally queries backend LinkShield or threat intelligence if online.
   * If offline or endpoint not yet approved, returns null.
   */
  public async queryBackendUrlAnalysis(url: string): Promise<BackendUrlAnalysisResponse | null> {
    if (!this.isOnline) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      // Graceful fallback to local heuristics without throwing
      return null;
    }
  }

  /**
   * Launches or focuses the SENTINEL INTELLIGENCE React web app.
   */
  public launchWebApp(route = ''): void {
    const targetUrl = `${DEFAULT_CONFIG.FRONTEND_APP_URL}${route}`;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank');
    }
  }
}

export const sentinelApi = new SentinelApiService();
