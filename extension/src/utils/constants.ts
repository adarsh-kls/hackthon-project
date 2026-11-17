import { SupportedFileExtension } from '../types/upload';

export const SUPPORTED_EXTENSIONS: readonly SupportedFileExtension[] = [
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'jpg',
  'png',
] as const;

export const SUPPORTED_MIME_TYPES: Record<string, SupportedFileExtension> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'pptx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export const TARGET_BRANDS: readonly string[] = [
  'google.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'paypal.com',
  'sbi.co.in',
  'hdfcbank.com',
  'icicibank.com',
  'axisbank.com',
  'incometax.gov.in',
  'uidai.gov.in',
  'netflix.com',
  'facebook.com',
  'github.com',
  'bankofamerica.com',
  'chase.com',
  'wellsfargo.com',
];

export const SUSPICIOUS_TLDS: readonly string[] = [
  '.xyz',
  '.top',
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.gq',
  '.buzz',
  '.fit',
  '.rest',
  '.cam',
  '.work',
  '.country',
  '.stream',
  '.download',
  '.click',
];

export const DEFAULT_CONFIG = {
  BACKEND_API_BASE: 'http://localhost:8000/api/v1',
  FRONTEND_APP_URL: 'http://localhost:5173',
  ENABLE_FORM_MONITOR: true,
  ENABLE_UPLOAD_MONITOR: true,
  SHOW_INPAGE_BADGE: true,
};
