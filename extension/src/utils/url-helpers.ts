/**
 * Calculates Shannon entropy for a string (e.g. domain name).
 * Higher entropy usually indicates machine-generated (DGA) domains.
 */
export function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const frequencies: Record<string, number> = {};

  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return Math.round(entropy * 100) / 100;
}

/**
 * Computes Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks whether the hostname is a direct IPv4 or IPv6 address.
 */
export function isIpAddress(hostname: string): boolean {
  // Strip port if present
  const cleanHost = hostname.replace(/:\d+$/, '');

  // IPv4 regex
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(cleanHost)) return true;

  // IPv6 regex
  const ipv6Regex = /^(\[)?[a-fA-F0-9:]+(\])?$/;
  if (cleanHost.includes(':') && ipv6Regex.test(cleanHost)) return true;

  return false;
}

/**
 * Checks if the hostname is punycode encoded or contains non-ASCII mixed script homographs.
 */
export function isPunycodeOrHomograph(hostname: string): boolean {
  if (hostname.toLowerCase().includes('xn--')) return true;
  // Non-ASCII character detection
  // eslint-disable-next-line no-control-regex
  return /[^\u0000-\u007F]/.test(hostname);
}

/**
 * Splits hostname into subdomains, base domain, and tld.
 */
export function extractDomainParts(hostname: string): {
  subdomains: string[];
  baseDomain: string;
  tld: string;
} {
  const cleanHost = hostname.toLowerCase().replace(/:\d+$/, '');
  const parts = cleanHost.split('.');

  if (parts.length <= 1) {
    return { subdomains: [], baseDomain: cleanHost, tld: '' };
  }

  // Handle multi-part ccTLDs like .co.in, .gov.in, .co.uk
  const secondLevelTLDs = ['co.in', 'gov.in', 'ac.in', 'net.in', 'org.in', 'co.uk', 'gov.uk', 'com.au', 'com.br'];
  const lastTwo = parts.slice(-2).join('.');
  
  if (parts.length >= 3 && secondLevelTLDs.includes(lastTwo)) {
    const tld = lastTwo;
    const baseDomain = parts[parts.length - 3] + '.' + tld;
    const subdomains = parts.slice(0, parts.length - 3);
    return { subdomains, baseDomain, tld };
  }

  const tld = '.' + parts[parts.length - 1];
  const baseDomain = parts.slice(-2).join('.');
  const subdomains = parts.slice(0, -2);

  return { subdomains, baseDomain, tld };
}

/**
 * Detects if a domain name is closely mimicking a known brand (Typosquatting).
 */
export function checkTyposquatting(
  domain: string,
  targetBrands: readonly string[]
): { target: string; distance: number } | null {
  const cleanDomain = domain.toLowerCase();
  const domainNoTld = cleanDomain.split('.')[0];

  for (const brand of targetBrands) {
    const brandNoTld = brand.toLowerCase().split('.')[0];

    // If it's an exact match, it is the authentic brand, not a typosquat
    if (cleanDomain === brand) continue;

    // Check distance between main domain labels
    const dist = levenshteinDistance(domainNoTld, brandNoTld);
    
    // Distance 1 or 2 on words length >= 4 indicates potential typosquatting
    if (dist > 0 && dist <= 2 && brandNoTld.length >= 4 && Math.abs(domainNoTld.length - brandNoTld.length) <= 2) {
      return { target: brand, distance: dist };
    }

    // Check if brand is contained within a suspicious compound domain (e.g. paypal-verify.com)
    if (domainNoTld.includes(brandNoTld) && domainNoTld !== brandNoTld) {
      return { target: brand, distance: 0 };
    }
  }

  return null;
}
