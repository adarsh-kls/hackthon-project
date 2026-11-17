import { analyzeDOMForm, classifyInputContext, extractDOMInputContext } from '../services/form-analyzer';
import { FormSecurityWarning, SensitiveFieldFinding } from '../types/forms';
import { ExtensionMessage } from '../types/messages';

export class FormDetector {
  private observedForms: Set<HTMLFormElement> = new Set();
  private processedInputs: Set<HTMLInputElement> = new Set();
  private collectedWarnings: FormSecurityWarning[] = [];

  public init(): void {
    this.scanPageForms();
    this.setupMutationObserver();
  }

  public scanPageForms(): FormSecurityWarning[] {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form'));
    this.collectedWarnings = [];

    for (const form of forms) {
      if (!this.observedForms.has(form)) {
        this.observeForm(form);
      }
      const warning = analyzeDOMForm(form);
      if (warning.hasSensitiveData) {
        this.collectedWarnings.push(warning);
      }
    }

    // Also scan inputs outside forms
    this.scanStandaloneInputs();

    if (this.collectedWarnings.length > 0) {
      this.sendWarningsToBackground();
    }

    return this.collectedWarnings;
  }

  private observeForm(form: HTMLFormElement): void {
    this.observedForms.add(form);

    // Pre-submission warning interception
    form.addEventListener('submit', (e) => {
      const warning = analyzeDOMForm(form);
      if (warning.hasSensitiveData) {
        // High risk if transmitting over unencrypted HTTP
        if (warning.isOverHttp) {
          const proceed = window.confirm(
            '⚠️ SENTINEL GUARD SECURITY ALERT:\n\n' +
              'This form requests sensitive information (such as ' +
              warning.sensitiveFields.map((f) => f.sensitiveType).join(', ') +
              ') over an UNENCRYPTED connection (HTTP).\n\n' +
              'Your sensitive data can be read by anyone on your network.\n\n' +
              'Do you really want to proceed with submitting?'
          );
          if (!proceed) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    });
  }

  private scanStandaloneInputs(): void {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input'));
    for (const input of inputs) {
      if (this.processedInputs.has(input)) continue;
      this.processedInputs.add(input);

      if (['submit', 'button', 'reset', 'hidden', 'image'].includes(input.type)) {
        continue;
      }

      const context = extractDOMInputContext(input);
      const finding = classifyInputContext(context);
      if (finding) {
        this.annotateSensitiveInput(input, finding);
      }
    }
  }

  private annotateSensitiveInput(input: HTMLInputElement, finding: SensitiveFieldFinding): void {
    // Avoid double tagging
    if (input.dataset.sentinelTagged) return;
    input.dataset.sentinelTagged = 'true';

    // Highlight border slightly on focus
    input.addEventListener('focus', () => {
      this.showInputTooltip(input, finding);
    });

    input.addEventListener('blur', () => {
      this.hideInputTooltip();
    });
  }

  private tooltipElement: HTMLElement | null = null;

  private showInputTooltip(input: HTMLInputElement, finding: SensitiveFieldFinding): void {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.id = 'sentinel-input-tooltip';
      document.body.appendChild(this.tooltipElement);
    }

    const rect = input.getBoundingClientRect();

    this.tooltipElement.innerHTML = `
      <style>
        #sentinel-input-tooltip {
          position: absolute;
          z-index: 2147483647;
          background: #1e293b;
          color: #f1f5f9;
          border: 1px solid #38bdf8;
          border-radius: 6px;
          padding: 6px 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          pointer-events: none;
          max-width: 260px;
          line-height: 1.3;
        }
        #sentinel-input-tooltip .tag {
          color: #38bdf8;
          font-weight: 600;
          margin-bottom: 2px;
          display: block;
        }
      </style>
      <span class="tag">🛡️ SENTINEL: ${finding.sensitiveType} Request</span>
      <div>${finding.riskExplanation}</div>
    `;

    const top = rect.bottom + window.scrollY + 4;
    const left = rect.left + window.scrollX;
    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
    this.tooltipElement.style.display = 'block';
  }

  private hideInputTooltip(): void {
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none';
    }
  }

  private setupMutationObserver(): void {
    const observer = new MutationObserver(() => {
      this.scanPageForms();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private sendWarningsToBackground(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      const message: ExtensionMessage<FormSecurityWarning[]> = {
        type: 'FORM_SENSITIVITY_EVENT',
        payload: this.collectedWarnings,
      };
      chrome.runtime.sendMessage(message).catch(() => {});
    }
  }
}
