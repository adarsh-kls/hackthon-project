import { SecurityReport } from './security';
import { FormSecurityWarning } from './forms';
import { DetectedFileSummary } from './upload';

export type MessageType =
  | 'EVALUATE_CURRENT_URL'
  | 'URL_SECURITY_REPORT'
  | 'FORM_SENSITIVITY_EVENT'
  | 'FILE_UPLOAD_INTERCEPTED'
  | 'GET_ACTIVE_TAB_DATA'
  | 'ACTIVE_TAB_DATA_RESPONSE'
  | 'OPEN_SENTINEL_DASHBOARD'
  | 'CHECK_BACKEND_HEALTH'
  | 'NOTIFY_USER';

export interface TabSecurityState {
  tabId: number;
  url: string;
  domain: string;
  securityReport: SecurityReport;
  formWarnings: FormSecurityWarning[];
  pendingUploads: DetectedFileSummary[];
  backendConnected: boolean;
  updatedAt: number;
}

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  tabId?: number;
}
