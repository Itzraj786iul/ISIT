import { describe, it, expect } from 'vitest';
import { normalizeEmail, parsePassword, normalizeInviteCode } from '@/lib/validation';

describe('normalizeEmail', () => {
  it('trims and lowercases valid emails', () => {
    expect(normalizeEmail('  Test@Example.COM ')).toBe('test@example.com');
  });
  it('returns null for invalid input', () => {
    expect(normalizeEmail('not-an-email')).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });
});

describe('parsePassword', () => {
  it('accepts non-empty strings within limit', () => {
    expect(parsePassword('secret')).toBe('secret');
  });
  it('rejects empty', () => {
    expect(parsePassword('')).toBeNull();
  });
});

describe('normalizeInviteCode', () => {
  it('uppercases and trims', () => {
    expect(normalizeInviteCode('  abc123  ')).toBe('ABC123');
  });
});
