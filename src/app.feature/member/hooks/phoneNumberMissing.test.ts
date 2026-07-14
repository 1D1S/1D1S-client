import { describe, expect, it } from 'vitest';

import { isPhoneNumberMissing } from './phoneNumberMissing';

describe('isPhoneNumberMissing', () => {
  it('인증 확정 + 데이터 도착 + phoneNumber 없음이면 true', () => {
    expect(isPhoneNumberMissing('authenticated', {})).toBe(true);
    expect(isPhoneNumberMissing('authenticated', { phoneNumber: '' })).toBe(
      true
    );
  });

  it('phoneNumber 가 있으면 false', () => {
    expect(
      isPhoneNumberMissing('authenticated', { phoneNumber: '01012345678' })
    ).toBe(false);
  });

  it('데이터 미도착(로딩 중)이면 false', () => {
    expect(isPhoneNumberMissing('authenticated', undefined)).toBe(false);
  });

  it('인증 미확정(unknown/guest)이면 false', () => {
    expect(isPhoneNumberMissing('unknown', {})).toBe(false);
    expect(isPhoneNumberMissing('guest', {})).toBe(false);
  });
});
