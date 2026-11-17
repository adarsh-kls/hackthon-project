import { describe, it, expect } from 'vitest';
import { evaluateWebsiteSecurity } from '../src/services/security-check';
import {
  calculateShannonEntropy,
  checkTyposquatting,
  extractDomainParts,
  isIpAddress,
  isPunycodeOrHomograph,
  levenshteinDistance,
} from '../src/utils/url-helpers';
import { TARGET_BRANDS } from '../src/utils/constants';

describe('Website Security Heuristics & Helpers', () => {
  describe('Levenshtein Distance', () => {
    it('calculates edit distances correctly', () => {
      expect(levenshteinDistance('paypal', 'paypal')).toBe(0);
      expect(levenshteinDistance('paypal', 'paypa1')).toBe(1);
      expect(levenshteinDistance('google', 'g00gle')).toBe(2);
      expect(levenshteinDistance('apple', 'aple')).toBe(1);
    });
  });

  describe('Shannon Entropy', () => {
    it('calculates low entropy for repetitive text', () => {
      const entropy = calculateShannonEntropy('aaaaaaa');
      expect(entropy).toBe(0);
    });

    it('calculates high entropy for random character sequences', () => {
      const normalEntropy = calculateShannonEntropy('google');
      const randomEntropy = calculateShannonEntropy('xq98zptm1wvk37');
      expect(randomEntropy).toBeGreaterThan(normalEntropy);
      expect(randomEntropy).toBeGreaterThan(3.5);
    });
  });

  describe('IP Hostname Detection', () => {
    it('identifies IPv4 addresses', () => {
      expect(isIpAddress('192.168.1.1')).toBe(true);
      expect(isIpAddress('104.244.42.1')).toBe(true);
      expect(isIpAddress('google.com')).toBe(false);
    });
  });

  describe('Punycode & Homographs', () => {
    it('identifies punycode domains', () => {
      expect(isPunycodeOrHomograph('xn--pple-43d.com')).toBe(true);
      expect(isPunycodeOrHomograph('apple.com')).toBe(false);
    });
  });

  describe('Typosquatting Detection', () => {
    it('flags domains closely mimicking target brands', () => {
      const res1 = checkTyposquatting('paypa1.com', TARGET_BRANDS);
      expect(res1).not.toBeNull();
      expect(res1?.target).toBe('paypal.com');

      const res2 = checkTyposquatting('g00gle.com', TARGET_BRANDS);
      expect(res2).not.toBeNull();
      expect(res2?.target).toBe('google.com');
    });

    it('does not flag authentic brand domains', () => {
      const res = checkTyposquatting('paypal.com', TARGET_BRANDS);
      expect(res).toBeNull();
    });
  });

  describe('Domain Parts Extraction', () => {
    it('extracts base domain and tld correctly for standard domains', () => {
      const res = extractDomainParts('sub.example.com');
      expect(res.baseDomain).toBe('example.com');
      expect(res.tld).toBe('.com');
      expect(res.subdomains).toEqual(['sub']);
    });

    it('handles second-level ccTLDs like .co.in', () => {
      const res = extractDomainParts('portal.sbi.co.in');
      expect(res.baseDomain).toBe('sbi.co.in');
      expect(res.tld).toBe('co.in');
      expect(res.subdomains).toEqual(['portal']);
    });
  });

  describe('End-to-End Website Evaluation', () => {
    it('evaluates safe HTTPS sites as SAFE', () => {
      const report = evaluateWebsiteSecurity('https://example.com');
      expect(report.level).toBe('SAFE');
      expect(report.protocol).toBe('https:');
      expect(report.score).toBeLessThan(30);
    });

    it('evaluates unencrypted HTTP sites with elevated threat', () => {
      const report = evaluateWebsiteSecurity('http://example-test-site.org');
      expect(report.level).toBe('SUSPICIOUS');
      expect(report.indicators.some((i) => i.category === 'HTTP_UNENCRYPTED')).toBe(true);
    });

    it('evaluates direct IP hostnames as DANGEROUS or SUSPICIOUS', () => {
      const report = evaluateWebsiteSecurity('http://198.51.100.15/login');
      expect(['SUSPICIOUS', 'DANGEROUS']).toContain(report.level);
      expect(report.indicators.some((i) => i.category === 'IP_HOSTNAME')).toBe(true);
    });

    it('evaluates typosquatted domains as DANGEROUS', () => {
      const report = evaluateWebsiteSecurity('https://paypa1.com/signin');
      expect(report.level).toBe('DANGEROUS');
      expect(report.indicators.some((i) => i.category === 'TYPOSQUATTING')).toBe(true);
    });

    it('evaluates suspicious TLDs appropriately', () => {
      const report = evaluateWebsiteSecurity('https://verify-account.xyz');
      expect(report.level).toBe('SUSPICIOUS');
      expect(report.indicators.some((i) => i.category === 'SUSPICIOUS_TLD')).toBe(true);
    });
  });
});
