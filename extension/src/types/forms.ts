export type SensitiveFieldType =
  | 'AADHAAR'
  | 'PAN'
  | 'CREDIT_CARD'
  | 'BANK_ACCOUNT'
  | 'IFSC'
  | 'PHONE'
  | 'EMAIL'
  | 'PASSWORD'
  | 'OTP';

export interface SensitiveFieldFinding {
  fieldId: string;
  fieldName: string;
  fieldType: string;
  sensitiveType: SensitiveFieldType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  matchedContext: string; // e.g. "Label 'Enter 12-digit Aadhaar' or placeholder"
  riskExplanation: string;
}

export interface FormSecurityWarning {
  formId?: string;
  formAction?: string;
  formMethod?: string;
  isOverHttp: boolean;
  sensitiveFields: SensitiveFieldFinding[];
  hasSensitiveData: boolean;
  timestamp: number;
}
