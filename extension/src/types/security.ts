export type SecurityLevel = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ThreatCategory =
  | 'HTTP_UNENCRYPTED'
  | 'IP_HOSTNAME'
  | 'HIGH_ENTROPY'
  | 'TYPOSQUATTING'
  | 'SUSPICIOUS_TLD'
  | 'EXCESSIVE_SUBDOMAINS'
  | 'PUNYCODE_HOMOGRAPH'
  | 'SUSPICIOUS_REDIRECT'
  | 'PORT_ANOMALY'
  | 'BACKEND_FLAGGED';

export interface ThreatIndicator {
  id: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  title: string;
  description: string;
  recommendation?: string;
  timestamp: number;
}

export interface SecurityReport {
  url: string;
  domain: string;
  protocol: 'https:' | 'http:' | string;
  level: SecurityLevel;
  score: number; // 0 (safest) to 100 (highest risk)
  indicators: ThreatIndicator[];
  assessedAt: string;
  backendVerified?: boolean;
  warningsExplanation?: string;
}
