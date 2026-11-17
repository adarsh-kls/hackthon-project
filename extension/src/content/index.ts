import { WebsiteMonitor } from './website-monitor';
import { FormDetector } from './form-detector';
import { UploadDetector } from './upload-detector';

// Initialize content script submodules
try {
  const websiteMonitor = new WebsiteMonitor();
  websiteMonitor.init();

  const formDetector = new FormDetector();
  formDetector.init();

  const uploadDetector = new UploadDetector();
  uploadDetector.init();

  // Listen for messages from background or popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'EVALUATE_CURRENT_URL') {
        const report = websiteMonitor.evaluateCurrentPage();
        sendResponse(report);
      }
      return true;
    });
  }
} catch (err) {
  console.error('[SENTINEL GUARD] Content script initialization error:', err);
}
