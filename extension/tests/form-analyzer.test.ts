import { describe, it, expect } from 'vitest';
import { classifyInputContext } from '../src/services/form-analyzer';

describe('Form & Input Sensitive Field Classification', () => {
  it('detects Aadhaar card input requests', () => {
    const finding = classifyInputContext({
      id: 'aadhaar-no',
      name: 'user_aadhaar',
      type: 'text',
      placeholder: 'Enter 12-digit Aadhaar Number',
      autocomplete: 'off',
      ariaLabel: '',
      labelText: 'Aadhaar Card',
    });

    expect(finding).not.toBeNull();
    expect(finding?.sensitiveType).toBe('AADHAAR');
    expect(finding?.confidence).toBe('HIGH');
  });

  it('detects PAN card input requests', () => {
    const finding = classifyInputContext({
      id: 'pan_number',
      name: 'panNumber',
      type: 'text',
      placeholder: 'ABCDE1234F',
      autocomplete: 'off',
      ariaLabel: '',
      labelText: 'Permanent Account Number (PAN)',
    });

    expect(finding).not.toBeNull();
    expect(finding?.sensitiveType).toBe('PAN');
  });

  it('avoids false positives for words containing pan like "company" or "japan"', () => {
    const finding = classifyInputContext({
      id: 'company_name',
      name: 'company',
      type: 'text',
      placeholder: 'Enter Company or Country (e.g. Japan)',
      autocomplete: 'off',
      ariaLabel: '',
      labelText: 'Company',
    });

    expect(finding).toBeNull();
  });

  it('detects credit card number inputs', () => {
    const finding = classifyInputContext({
      id: 'cc_num',
      name: 'cardNumber',
      type: 'text',
      placeholder: 'XXXX-XXXX-XXXX-XXXX',
      autocomplete: 'cc-number',
      ariaLabel: 'Credit or Debit Card Number',
      labelText: 'Card Number',
    });

    expect(finding).not.toBeNull();
    expect(finding?.sensitiveType).toBe('CREDIT_CARD');
  });

  it('detects CVV and security codes', () => {
    const finding = classifyInputContext({
      id: 'card_cvv',
      name: 'cvv',
      type: 'password',
      placeholder: 'CVV',
      autocomplete: 'cc-csc',
      ariaLabel: '',
      labelText: 'Security Code',
    });

    expect(finding).not.toBeNull();
    // type password classifies as PASSWORD or CVV
    expect(['CREDIT_CARD', 'PASSWORD']).toContain(finding?.sensitiveType);
  });

  it('detects Bank Account and IFSC requests', () => {
    const bankFinding = classifyInputContext({
      id: 'acc_no',
      name: 'bankAccount',
      type: 'text',
      placeholder: 'Enter Account Number',
      autocomplete: 'off',
      ariaLabel: '',
      labelText: 'Bank Account Number',
    });
    expect(bankFinding?.sensitiveType).toBe('BANK_ACCOUNT');

    const ifscFinding = classifyInputContext({
      id: 'ifsc_code',
      name: 'branch_ifsc',
      type: 'text',
      placeholder: 'e.g. SBIN0001234',
      autocomplete: 'off',
      ariaLabel: '',
      labelText: 'IFSC Code',
    });
    expect(ifscFinding?.sensitiveType).toBe('IFSC');
  });

  it('detects passwords by explicit input type', () => {
    const finding = classifyInputContext({
      id: 'user_pass',
      name: 'auth_key',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'current-password',
      ariaLabel: '',
      labelText: 'Access Key',
    });

    expect(finding).not.toBeNull();
    expect(finding?.sensitiveType).toBe('PASSWORD');
  });

  it('returns null for benign input fields like search or standard names', () => {
    const searchFinding = classifyInputContext({
      id: 'search-query',
      name: 'q',
      type: 'text',
      placeholder: 'Search documentation...',
      autocomplete: 'off',
      ariaLabel: 'Search',
      labelText: '',
    });

    expect(searchFinding).toBeNull();
  });
});
