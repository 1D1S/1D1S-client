import { describe, expect, it } from 'vitest';

import {
  formatPhoneNumber,
  normalizePhoneNumber,
  validatePhoneNumber,
} from './phoneNumber';

describe('validatePhoneNumber', () => {
  it.each(['010-1234-5678', '01012345678', '010-123-4567', '0111234567'])(
    'accepts valid number %s (하이픈 유무 무관)',
    (value) => {
      expect(validatePhoneNumber(value)).toBe('');
    }
  );

  it('rejects empty input with a required message', () => {
    expect(validatePhoneNumber('')).toBe('전화번호를 입력해 주세요.');
  });

  it.each(['02-123-4567', '010-12-5678', 'abcd', '010123456789'])(
    'rejects malformed number %s',
    (value) => {
      expect(validatePhoneNumber(value)).toBe('올바른 전화번호 형식이 아니에요.');
    }
  );
});

describe('normalizePhoneNumber', () => {
  it('strips hyphens and non-digits', () => {
    expect(normalizePhoneNumber('010-1234-5678')).toBe('01012345678');
    expect(normalizePhoneNumber(' 010 1234 5678 ')).toBe('01012345678');
  });
});

describe('formatPhoneNumber', () => {
  it('inserts hyphens for an 11-digit number', () => {
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
  });

  it('inserts hyphens for a 10-digit number', () => {
    expect(formatPhoneNumber('0111234567')).toBe('011-123-4567');
  });

  it('formats progressively while typing', () => {
    expect(formatPhoneNumber('010')).toBe('010');
    expect(formatPhoneNumber('0101')).toBe('010-1');
    expect(formatPhoneNumber('0101234')).toBe('010-1234');
  });

  it('caps at 11 digits and ignores existing hyphens', () => {
    expect(formatPhoneNumber('010-1234-5678999')).toBe('010-1234-5678');
  });
});
