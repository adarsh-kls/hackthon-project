import { SecurityLevel, SecurityReport, ThreatIndicator } from '../types/security';
import {
  calculateShannonEntropy,
  checkTyposquatting,
  extractDomainParts,
  isIpAddress,
  isPunycodeOrHomograph,
} from '../utils/url-helpers';
import { SUSPICIOUS_TLDS, TARGET_BRANDS } from '../utils/constants';

/**
 * Evaluates website security posture using multi-vector heuristics.
 *
 * IMPORTANT: Heuristic results are never presented as guaranteed safety.
 * HTTPS alone does NOT establish website trustworthiness.
 */
export function evaluateWebsiteSecurity(rawUrl: string): SecurityReport {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return {
      url: rawUrl,
      domain: 'invalid-url',
      protocol: 'unknown',
      level: 'DANGEROUS',
      score: 100,
      indicators: [
        {
          id: 'invalid-url',
          category: 'BACKEND_FLAGGED',
          severity: 'critical',
          title: 'Malformed URL',
          description: 'The supplied URL could not be safely parsed.',
          recommendation: 'Do not interact with this address.',
          timestamp: Date.now(),
        },
      ],
      assessedAt: new Date().toISOString(),
      warningsExplanation: 'Malformed or unparseable target URL.',
    };
  }

  const hostname = parsedUrl.hostname;
  const protocol = parsedUrl.protocol;
  const port = parsedUrl.port;
  const indicators: ThreatIndicator[] = [];
  let riskScore = 0;

  // Internal/Localhost addresses (treat gently in development)
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.test');

  // 1. Protocol Assessment
  if (protocol === 'http:') {
    if (!isLocal) {
      riskScore += 35;
      indicators.push({
        id: 'unencrypted-http',
        category: 'HTTP_UNENCRYPTED',
        severity: 'high',
        title: 'Unencrypted Connection (HTTP)',
        description:
          'Traffic to this site is transmitted in cleartext. Anyone on the network can view or intercept data.',
        recommendation: 'Never submit passwords, personal identity, or card details on unencrypted HTTP pages.',
        timestamp: Date.now(),
      });
    }
  } else if (protocol !== 'https:' && protocol !== 'chrome:') {
    riskScore += 40;
    indicators.push({
      id: 'unusual-protocol',
      category: 'BACKEND_FLAGGED',
      severity: 'medium',
      title: `Unusual Protocol (${protocol})`,
      description: `Target is using non-standard web protocol: ${protocol}`,
      timestamp: Date.now(),
    });
  }

  // If local, cap evaluation
  if (isLocal) {
    return {
      url: rawUrl,
      domain: hostname,
      protocol: protocol as 'https:' | 'http:',
      level: 'SAFE',
      score: 0,
      indicators: [],
      assessedAt: new Date().toISOString(),
      warningsExplanation: 'Local environment / development host.',
    };
  }

  // 2. Direct IP Address Hostname
  if (isIpAddress(hostname)) {
    riskScore += 45;
    indicators.push({
      id: 'ip-hostname',
      category: 'IP_HOSTNAME',
      severity: 'high',
      title: 'Direct IP Hostname Detected',
      description: `Website is accessed directly via numeric IP address (${hostname}) instead of a registered domain name. This is common in phishing attacks.`,
      recommendation: 'Verify why this destination does not utilize a recognized public domain.',
      timestamp: Date.now(),
    });
  }

  // 3. Punycode & Homograph Attacks
  if (isPunycodeOrHomograph(hostname)) {
    riskScore += 50;
    indicators.push({
      id: 'punycode-homograph',
      category: 'PUNYCODE_HOMOGRAPH',
      severity: 'critical',
      title: 'Punycode / Homograph Impersonation Risk',
      description:
        'Domain contains punycode ("xn--") or non-ASCII characters that may visually mimic legitimate Latin letters.',
      recommendation: 'Extreme caution: Attackers use visual homoglyphs to deceive users into visiting fake portals.',
      timestamp: Date.now(),
    });
  }

  // 4. Domain Structure & Subdomain Analysis
  const { subdomains, baseDomain, tld } = extractDomainParts(hostname);

  if (subdomains.length >= 3) {
    riskScore += 25;
    indicators.push({
      id: 'excessive-subdomains',
      category: 'EXCESSIVE_SUBDOMAINS',
      severity: 'medium',
      title: 'Excessive Subdomain Depth',
      description: `Domain has ${subdomains.length} subdomain levels (${subdomains.join('.')}). Attackers frequently prepend trusted brand names as subdomains.`,
      recommendation: 'Verify the true root domain before providing credentials.',
      timestamp: Date.now(),
    });
  }

  // 5. Suspicious TLD check
  if (SUSPICIOUS_TLDS.some((badTld) => tld.endsWith(badTld))) {
    riskScore += 25;
    indicators.push({
      id: 'suspicious-tld',
      category: 'SUSPICIOUS_TLD',
      severity: 'medium',
      title: `High-Risk Top-Level Domain (${tld})`,
      description: `This TLD (${tld}) has a statistically elevated association with disposable spam and credential harvesting sites.`,
      recommendation: 'Verify the authenticity of the organization managing this domain.',
      timestamp: Date.now(),
    });
  }

  // 6. Brand Typosquatting / Impersonation Check
  const typosquat = checkTyposquatting(baseDomain, TARGET_BRANDS);
  if (typosquat) {
    riskScore += 50;
    indicators.push({
      id: 'typosquatting-detected',
      category: 'TYPOSQUATTING',
      severity: 'critical',
      title: `Potential Brand Impersonation (${typosquat.target})`,
      description: `Domain "${baseDomain}" closely resembles the legitimate domain "${typosquat.target}". This is a primary indicator of phishing.`,
      recommendation: `Navigate directly to https://${typosquat.target} instead of following external links.`,
      timestamp: Date.now(),
    });
  }

  // 7. Shannon Entropy on Domain
  const entropy = calculateShannonEntropy(baseDomain.split('.')[0]);
  if (entropy > 3.8 && baseDomain.length > 10) {
    riskScore += 20;
    indicators.push({
      id: 'high-entropy-domain',
      category: 'HIGH_ENTROPY',
      severity: 'medium',
      title: 'High Domain Randomness (DGA Indicator)',
      description: `Domain label exhibits high character randomness (Entropy: ${entropy}), typical of algorithmically generated domains.`,
      timestamp: Date.now(),
    });
  }

  // 8. Non-standard port on public web
  if (port && port !== '80' && port !== '443') {
    riskScore += 15;
    indicators.push({
      id: 'non-standard-port',
      category: 'PORT_ANOMALY',
      severity: 'low',
      title: `Non-Standard Port (${port})`,
      description: `Website is serving web traffic over custom port ${port}.`,
      timestamp: Date.now(),
    });
  }

  // Score clamping & Classification
  const finalScore = Math.min(100, riskScore);

  let level: SecurityLevel = 'SAFE';
  let warningsExplanation: string | undefined;

  if (finalScore >= 60 || indicators.some((i) => i.severity === 'critical')) {
    level = 'DANGEROUS';
    warningsExplanation =
      'Strong threat indicators detected. This site may be impersonating an institution or exposing your data to interception.';
  } else if (finalScore >= 25 || indicators.length > 0) {
    level = 'SUSPICIOUS';
    warningsExplanation =
      'One or more security concerns detected. Exercise caution before entering credentials or submitting documents.';
  } else {
    level = 'SAFE';
    warningsExplanation =
      'No critical automated warning signals detected. (Note: Heuristics do not constitute an absolute security guarantee).';
  }

  return {
    url: rawUrl,
    domain: hostname,
    protocol: protocol as 'https:' | 'http:',
    level,
    score: finalScore,
    indicators,
    assessedAt: new Date().toISOString(),
    warningsExplanation,
  };
}
