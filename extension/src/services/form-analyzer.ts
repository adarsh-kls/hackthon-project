import { FormSecurityWarning, SensitiveFieldFinding, SensitiveFieldType } from '../types/forms';

interface InputContext {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  autocomplete: string;
  ariaLabel: string;
  labelText: string;
}

interface SensitivityRule {
  type: SensitiveFieldType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  keywords: RegExp[];
  negativeKeywords?: RegExp[];
  riskExplanation: string;
}

const SENSITIVITY_RULES: SensitivityRule[] = [
  // 1. Aadhaar Card (Indian National ID)
  {
    type: 'AADHAAR',
    confidence: 'HIGH',
    keywords: [
      /\baadhaar\b/i,
      /\badhar\b/i,
      /\buidai\b/i,
      /\buid\s*number\b/i,
      /\b12[- ]*digit\s*(id|number|aadhaar)\b/i,
    ],
    riskExplanation:
      'Aadhaar is a sensitive biometric/government identity number in India. Unauthorized entry risks identity theft and financial profiling.',
  },
  // 2. PAN Card (Permanent Account Number)
  {
    type: 'PAN',
    confidence: 'HIGH',
    keywords: [
      /\bpan\s*(card|number|no)?\b/i,
      /\bpermanent\s*account\s*number\b/i,
      /\bpan_no\b/i,
    ],
    negativeKeywords: [/\bcompany\b/i, /\bjapan\b/i, /\bspan\b/i, /\bpane\b/i],
    riskExplanation:
      'PAN numbers uniquely identify tax accounts in India. Exposure enables fraudulent credit lines and tax identity impersonation.',
  },
  // 3. Payment Card Information (Credit/Debit/CVV)
  {
    type: 'CREDIT_CARD',
    confidence: 'HIGH',
    keywords: [
      /\bcard\s*number\b/i,
      /\bcredit\s*card\b/i,
      /\bdebit\s*card\b/i,
      /\bcvv\b/i,
      /\bcvc\b/i,
      /\bsecurity\s*code\b/i,
      /\bcard\s*expiry\b/i,
      /\bexp\s*month\b/i,
      /\bexp\s*year\b/i,
      /\bexp\s*date\b/i,
      /\bexpir(y|ation)\b/i,
      /\bname\s*on\s*card\b/i,
    ],
    riskExplanation:
      'Payment card details can be directly exploited for fraudulent online financial transactions.',
  },
  // 4. Banking Information (Account Number, IFSC)
  {
    type: 'BANK_ACCOUNT',
    confidence: 'HIGH',
    keywords: [
      /\bbank\s*account\b/i,
      /\baccount\s*number\b/i,
      /\bacc\s*(no|num|number)\b/i,
      /\bbeneficiary\s*account\b/i,
      /\biban\b/i,
      /\brouting\s*number\b/i,
    ],
    riskExplanation:
      'Bank account numbers can expose accounts to unauthorized direct debits and targeted phishing.',
  },
  {
    type: 'IFSC',
    confidence: 'HIGH',
    keywords: [
      /\bifsc\b/i,
      /\bifsc\s*code\b/i,
      /\bswift\s*code\b/i,
      /\bmicr\b/i,
    ],
    riskExplanation:
      'IFSC / SWIFT identifies your specific banking branch and is combined with account numbers in transaction fraud.',
  },
  // 5. OTP / Verification Code
  {
    type: 'OTP',
    confidence: 'HIGH',
    keywords: [
      /\botp\b/i,
      /\bone\s*time\s*password\b/i,
      /\bverification\s*code\b/i,
      /\bsecurity\s*pin\b/i,
      /\bpasscode\b/i,
    ],
    riskExplanation:
      'One-time passwords authorize critical transactions and identity handshakes. Never share OTPs on unverified sites.',
  },
  // 6. Credentials / Passwords
  {
    type: 'PASSWORD',
    confidence: 'HIGH',
    keywords: [
      /\bpassword\b/i,
      /\bpasswd\b/i,
      /\bpwd\b/i,
      /\bpin\b/i,
      /\bsecret\b/i,
    ],
    riskExplanation:
      'Account credentials grant full access to your profiles. Never submit passwords over unencrypted HTTP.',
  },
  // 7. Phone Numbers
  {
    type: 'PHONE',
    confidence: 'MEDIUM',
    keywords: [
      /\bphone\b/i,
      /\bmobile\b/i,
      /\btelephone\b/i,
      /\bcell\s*(no|number)?\b/i,
      /\bwhatsapp\b/i,
      /\bcontact\s*no\b/i,
    ],
    riskExplanation:
      'Phone numbers can be used for SIM swapping, spamming, and SMS phishing (smishing).',
  },
  // 8. Email Addresses
  {
    type: 'EMAIL',
    confidence: 'MEDIUM',
    keywords: [
      /\bemail\b/i,
      /\be-mail\b/i,
      /\bmail\b/i,
    ],
    riskExplanation:
      'Email addresses are frequently collected for spam, credential stuffing, and identity cross-referencing.',
  },
];

/**
 * Pure evaluation function using input context attributes.
 * NEVER reads or analyzes the actual input value to preserve zero-data privacy.
 */
export function classifyInputContext(context: InputContext): SensitiveFieldFinding | null {
  const combinedContext = [
    context.name,
    context.id,
    context.placeholder,
    context.autocomplete,
    context.ariaLabel,
    context.labelText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // If input type is password, immediately classify as PASSWORD
  if (context.type === 'password') {
    return {
      fieldId: context.id || context.name || 'unnamed-password-field',
      fieldName: context.name || 'password',
      fieldType: context.type,
      sensitiveType: 'PASSWORD',
      confidence: 'HIGH',
      matchedContext: 'Input type is explicitly "password"',
      riskExplanation:
        'Account credentials grant full access to your profiles. Never submit passwords on suspicious sites.',
    };
  }

  // Check against sensitivity rules
  for (const rule of SENSITIVITY_RULES) {
    if (rule.negativeKeywords?.some((neg) => neg.test(combinedContext))) {
      continue;
    }

    for (const kw of rule.keywords) {
      if (kw.test(combinedContext)) {
        return {
          fieldId: context.id || context.name || `field-${rule.type.toLowerCase()}`,
          fieldName: context.name || context.id || rule.type,
          fieldType: context.type,
          sensitiveType: rule.type,
          confidence: rule.confidence,
          matchedContext: `Detected matching pattern: ${kw.source}`,
          riskExplanation: rule.riskExplanation,
        };
      }
    }
  }

  return null;
}

/**
 * Extracts context from a live HTMLInputElement without reading its value.
 */
export function extractDOMInputContext(input: HTMLInputElement): InputContext {
  const id = input.id || '';
  const name = input.name || '';
  const type = (input.type || 'text').toLowerCase();
  const placeholder = input.placeholder || '';
  const autocomplete = input.autocomplete || '';
  const ariaLabel = input.getAttribute('aria-label') || '';

  let labelText = '';

  // 1. Associated label via `for` attribute
  if (id) {
    const labelElem = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (labelElem && labelElem.textContent) {
      labelText += labelElem.textContent + ' ';
    }
  }

  // 2. Parent label enclosing input
  const parentLabel = input.closest('label');
  if (parentLabel && parentLabel.textContent) {
    labelText += parentLabel.textContent + ' ';
  }

  // 3. Preceding text / sibling elements
  const prevSibling = input.previousElementSibling;
  if (prevSibling && prevSibling.textContent && prevSibling.textContent.length < 100) {
    labelText += prevSibling.textContent + ' ';
  }

  return {
    id,
    name,
    type,
    placeholder,
    autocomplete,
    ariaLabel,
    labelText: labelText.trim(),
  };
}

/**
 * Evaluates an entire HTMLFormElement for sensitive field requests.
 */
export function analyzeDOMForm(form: HTMLFormElement): FormSecurityWarning {
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input, textarea, select'));
  const sensitiveFindings: SensitiveFieldFinding[] = [];

  for (const input of inputs) {
    if (input instanceof HTMLInputElement) {
      if (['submit', 'button', 'reset', 'hidden', 'image'].includes(input.type)) {
        continue;
      }
      const context = extractDOMInputContext(input);
      const finding = classifyInputContext(context);
      if (finding) {
        sensitiveFindings.push(finding);
      }
    }
  }

  const isOverHttp = window.location.protocol === 'http:';

  return {
    formId: form.id || undefined,
    formAction: form.action || undefined,
    formMethod: (form.method || 'GET').toUpperCase(),
    isOverHttp,
    sensitiveFields: sensitiveFindings,
    hasSensitiveData: sensitiveFindings.length > 0,
    timestamp: Date.now(),
  };
}
