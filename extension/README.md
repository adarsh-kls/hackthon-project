# SENTINEL GUARD — Chrome Browser Extension (M1)

**SENTINEL GUARD** is an AI-powered, privacy-conscious Chrome extension designed as the first layer of defense in the SENTINEL data loss prevention and threat detection platform. It continuously evaluates website security, identifies suspicious browsing activity, flags contextual sensitive information requests (such as Aadhaar, PAN, and banking details), and prompts users to inspect documents before uploading them to the web.

---

## 1. Core Architecture

The extension is built under Chrome **Manifest V3** with **TypeScript** and **React 18**:

```
extension/
├── public/
│   ├── manifest.json           # Manifest V3 specification
│   └── icons/                  # 16px, 48px, 128px shield icons
├── src/
│   ├── background/
│   │   └── service-worker.ts   # MV3 background worker for tab state & badges
│   ├── content/
│   │   ├── index.ts            # Content script entry point
│   │   ├── website-monitor.ts  # In-page DOM & SPA URL navigation monitoring
│   │   ├── form-detector.ts    # Sensitive form detection & submission interception
│   │   └── upload-detector.ts  # File input & dropzone interceptor with consent dialog
│   ├── popup/
│   │   ├── index.html          # Popup host HTML
│   │   ├── main.tsx            # React root mount
│   │   ├── App.tsx             # Main popup UI state router
│   │   └── components/
│   │       ├── Header.tsx      # Extension header & backend status pill
│   │       ├── SecurityCard.tsx# Primary status card (SAFE / SUSPICIOUS / DANGEROUS)
│   │       ├── ThreatAlert.tsx # Granular heuristics breakdown & recommendations
│   │       ├── DocumentAlert.tsx# Intercepted file pre-upload inspection view
│   │       └── FormAlert.tsx   # Detected sensitive inputs summary
│   ├── services/
│   │   ├── api.ts              # FastAPI backend integration client with fallback
│   │   ├── security-check.ts   # Multi-vector heuristic scoring engine
│   │   └── form-analyzer.ts    # Contextual sensitive input classifier
│   ├── types/                  # TypeScript interfaces (security, forms, uploads, messages)
│   └── utils/
│       ├── constants.ts        # Target brands, suspicious TLDs, supported extensions
│       └── url-helpers.ts      # Shannon entropy, Levenshtein distance, IP/Punycode detection
├── tests/
│   ├── security-check.test.ts  # Heuristic scoring & URL algorithms tests
│   └── form-analyzer.test.ts   # Contextual sensitive input detection tests
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 2. Capabilities & Features

### A. Website Security Assessment
- **Protocol Evaluation**: Flags unencrypted `http://` sites; clarifies that `https://` is necessary but not sufficient for trustworthiness.
- **Direct IP Hostname Detection**: Flags direct IP navigation (`http://192.168.1.1` or public IPs) typical of malicious servers.
- **Punycode & Homograph Defense**: Identifies deceptive `xn--` or non-ASCII characters visually mimicking authentic brands.
- **Brand Typosquatting / Impersonation**: Uses Levenshtein distance to detect variations of critical brands (Google, Microsoft, SBI, HDFC, ICICI, PayPal, Amazon, etc.).
- **Domain Entropy Analysis**: Uses Shannon entropy to detect algorithmically generated domains (DGA).
- **Suspicious TLD Screening**: Flags high-abuse TLDs (`.xyz`, `.top`, `.tk`, `.buzz`, etc.).
- **Classification Status**:
  - `SAFE`: Clean reputation, encrypted protocol, no detected threat signals.
  - `SUSPICIOUS`: One or more concerning signals (amber warning).
  - `DANGEROUS`: Strong indicators of impersonation, cleartext credential transmission, or malicious patterns (red alert).

### B. Sensitive Information Request Detection
Detects forms requesting sensitive data without ever storing or reading values:
- **Indian National IDs**: Aadhaar (UIDAI 12-digit context), PAN numbers (`[A-Z]{5}[0-9]{4}[A-Z]`).
- **Financial Details**: Credit/Debit card numbers, CVV/CVC, Bank Account numbers, IFSC codes.
- **Authentication**: Passwords, OTPs, verification PINs.
- **Contact Info**: Phone numbers, Email addresses.
- **Privacy Enforcement**: Reads ONLY contextual DOM metadata (`type`, `name`, `id`, `placeholder`, `aria-label`, adjacent `<label>`). **Zero keystrokes or actual field values are read, logged, or transmitted.**

### C. File Upload Interception & Consent Flow
- **Supported Formats**: `.pdf`, `.docx`, `.xlsx`, `.pptx`, `.jpg`, `.png`.
- **Pre-Upload Recommendation**: When a file is selected via standard file dialog or dropped onto a dropzone, SENTINEL GUARD prompts the user to inspect the file for hidden PII, secrets, or embedded threats before submitting.
- **Zero Silent Uploads**: Files are NEVER transmitted without explicit user consent. Clicking *"Inspect with SENTINEL"* launches the web inspection dashboard.

### D. Compact Popup Interface
1. **Normal Website View**: Displays domain name, protocol status, reputation level, and a quick *"Scan a Document"* launcher.
2. **Threat Warning View**: Highlights specific risk indicators and remediation recommendations.
3. **Document Selected View**: Shows detected upload files with a direct *"Inspect & Protect Document"* call to action.

---

## 3. Backend Integration (M5 Coordination)

- **API Base URL**: Configurable, defaults to `http://localhost:8000/api/v1`.
- **Liveness & Health**: Automatically checks `GET /api/v1/health`.
- **Graceful Degradation**: If the backend is unreachable or offline, the extension seamlessly switches to **Standalone Heuristics Mode**, continuing all in-browser security checks without interrupting the browsing session.

---

## 4. Known Limitations & Edge Cases

1. **Non-Standard Upload Workflows**: Custom WebAssembly, Flash, raw clipboard copy-paste, or WebSockets that do not trigger standard `HTMLInputElement` `change` or DOM `drop` events cannot be universally intercepted by browser extension APIs.
2. **Heuristic Nature**: Heuristics indicate statistical threat probability and cannot guarantee 100% safety.
3. **Dynamic Single-Page Applications**: Forms rendered inside heavily isolated shadow DOMs or canvas elements may not expose standard accessible input labels.

---

## 5. Installation and Testing Guide

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Setup & Build
1. Navigate to the extension folder:
   ```bash
   cd extension
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run automated unit tests:
   ```bash
   npm test
   ```
4. Build the extension package:
   ```bash
   npm run build
   ```
   The compiled unpacked extension will be generated in `extension/dist/`.

### Loading into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the upper-right corner.
3. Click the **Load unpacked** button.
4. Select the `extension/dist` directory.
5. The **SENTINEL GUARD** shield icon will appear in your Chrome toolbar.
