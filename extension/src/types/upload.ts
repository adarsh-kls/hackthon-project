export type SupportedFileExtension = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'jpg' | 'png';

export interface DetectedFileSummary {
  id: string;
  fileName: string;
  fileExtension: SupportedFileExtension;
  fileSize: number; // in bytes
  mimeType: string;
  detectedAt: number;
  inputSelector?: string;
  inspectedStatus?: 'PENDING' | 'CONSENTED' | 'DISMISSED';
}

export interface UploadConsentResult {
  fileId: string;
  fileName: string;
  userConsented: boolean;
  actionTaken: 'INSPECT_IN_SENTINEL' | 'CONTINUE_WITHOUT_INSPECTION' | 'DISMISS';
}
