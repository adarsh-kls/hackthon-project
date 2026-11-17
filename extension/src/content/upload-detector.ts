import { DetectedFileSummary, SupportedFileExtension } from '../types/upload';
import { SUPPORTED_EXTENSIONS } from '../utils/constants';
import { ExtensionMessage } from '../types/messages';
import { DEFAULT_CONFIG } from '../utils/constants';

export class UploadDetector {
  private detectedFiles: DetectedFileSummary[] = [];
  private modalContainer: HTMLElement | null = null;

  public init(): void {
    this.attachFileInputListeners();
    this.attachDropListeners();
    this.observeDynamicInputs();
  }

  private attachFileInputListeners(): void {
    document.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.tagName === 'INPUT' && target.type === 'file' && target.files) {
        this.processFileList(target.files, target.id || target.name || 'file-input');
      }
    });
  }

  private attachDropListeners(): void {
    document.addEventListener('drop', (event: DragEvent) => {
      if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        this.processFileList(event.dataTransfer.files, 'drag-and-drop');
      }
    });
  }

  private observeDynamicInputs(): void {
    const observer = new MutationObserver(() => {
      // Re-scan or ensure listeners remain active on new dynamic content
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private processFileList(files: FileList, sourceSelector: string): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = this.extractExtension(file.name);

      if (ext && SUPPORTED_EXTENSIONS.includes(ext)) {
        const detected: DetectedFileSummary = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          fileExtension: ext,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          detectedAt: Date.now(),
          inputSelector: sourceSelector,
          inspectedStatus: 'PENDING',
        };

        this.detectedFiles.push(detected);
        this.notifyBackground(detected);
        this.showConsentRecommendationModal(detected, file);
      }
    }
  }

  private extractExtension(fileName: string): SupportedFileExtension | null {
    const parts = fileName.split('.');
    if (parts.length <= 1) return null;
    const ext = parts.pop()?.toLowerCase();
    if (ext && SUPPORTED_EXTENSIONS.includes(ext as SupportedFileExtension)) {
      return ext as SupportedFileExtension;
    }
    return null;
  }

  private notifyBackground(detected: DetectedFileSummary): void {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      const message: ExtensionMessage<DetectedFileSummary> = {
        type: 'FILE_UPLOAD_INTERCEPTED',
        payload: detected,
      };
      chrome.runtime.sendMessage(message).catch(() => {});
    }
  }

  /**
   * Shows user recommendation and requests EXPLICIT consent.
   * Zero silent uploads: User must click "Inspect with SENTINEL".
   */
  public showConsentRecommendationModal(detected: DetectedFileSummary, _rawFile: File): void {
    if (this.modalContainer) {
      this.modalContainer.remove();
    }

    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'sentinel-upload-consent-dialog';
    document.body.appendChild(this.modalContainer);

    const sizeFormatted = (detected.fileSize / 1024).toFixed(1) + ' KB';

    this.modalContainer.innerHTML = `
      <style>
        #sentinel-upload-consent-dialog {
          position: fixed;
          top: 30px;
          right: 30px;
          z-index: 2147483647;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #3b82f6;
          border-left: 5px solid #3b82f6;
          border-radius: 10px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
          padding: 16px;
          max-width: 380px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.4;
          animation: sentinelFadeIn 0.25s ease-out;
        }
        @keyframes sentinelFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #sentinel-upload-consent-dialog h4 {
          margin: 0 0 6px 0;
          font-size: 14px;
          font-weight: 600;
          color: #60a5fa;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        #sentinel-upload-consent-dialog .file-box {
          background: #1e293b;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
          border: 1px solid #334155;
        }
        #sentinel-upload-consent-dialog .file-box .name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }
        #sentinel-upload-consent-dialog .file-box .size {
          color: #94a3b8;
        }
        #sentinel-upload-consent-dialog p {
          font-size: 12px;
          color: #cbd5e1;
          margin: 0 0 12px 0;
        }
        #sentinel-upload-consent-dialog .actions {
          display: flex;
          gap: 8px;
        }
        #sentinel-upload-consent-dialog .btn-inspect {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          flex: 1;
        }
        #sentinel-upload-consent-dialog .btn-inspect:hover {
          background: #1d4ed8;
        }
        #sentinel-upload-consent-dialog .btn-dismiss {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #475569;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        #sentinel-upload-consent-dialog .btn-dismiss:hover {
          background: #1e293b;
          color: #ffffff;
        }
      </style>
      <h4>🛡️ SENTINEL Pre-Upload Check</h4>
      <div class="file-box">
        <span class="name">📄 ${detected.fileName}</span>
        <span class="size">${sizeFormatted}</span>
      </div>
      <p>
        You are about to upload a <strong>.${detected.fileExtension.toUpperCase()}</strong> file.
        Inspect it for hidden Aadhaar/PAN numbers, credentials, or embedded threats before submission.
      </p>
      <div class="actions">
        <button class="btn-inspect" id="sentinel-btn-inspect">Inspect with SENTINEL</button>
        <button class="btn-dismiss" id="sentinel-btn-dismiss">Skip</button>
      </div>
    `;

    const inspectBtn = this.modalContainer.querySelector('#sentinel-btn-inspect');
    const dismissBtn = this.modalContainer.querySelector('#sentinel-btn-dismiss');

    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        detected.inspectedStatus = 'CONSENTED';
        this.openSentinelIntelligenceForInspection(detected);
        this.modalContainer?.remove();
        this.modalContainer = null;
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        detected.inspectedStatus = 'DISMISSED';
        this.modalContainer?.remove();
        this.modalContainer = null;
      });
    }
  }

  private openSentinelIntelligenceForInspection(detected: DetectedFileSummary): void {
    // Open SENTINEL INTELLIGENCE Upload page with parameters
    const uploadUrl = `${DEFAULT_CONFIG.FRONTEND_APP_URL}/upload?fileName=${encodeURIComponent(
      detected.fileName
    )}&fileType=${detected.fileExtension}`;

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'OPEN_SENTINEL_DASHBOARD',
        payload: { url: uploadUrl },
      });
    } else {
      window.open(uploadUrl, '_blank');
    }
  }
}
