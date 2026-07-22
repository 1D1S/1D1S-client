import { describe, expect, it } from 'vitest';

import { getProviderConfig } from './providerConfig';

describe('getProviderConfig', () => {
  it('APPLE 을 지원한다(과거 undefined 로 .bg 접근 시 크래시했던 케이스)', () => {
    const config = getProviderConfig('APPLE');

    expect(config.label).toBe('Apple');
    expect(config.bg).toBe('bg-black');
    expect(config.textColor).toBe('text-white');
    expect(config.icon).toBeNull();
  });

  it('기존 프로바이더 표시는 그대로 유지한다', () => {
    expect(getProviderConfig('KAKAO').label).toBe('카카오');
    expect(getProviderConfig('NAVER').label).toBe('네이버');
    expect(getProviderConfig('GOOGLE').label).toBe('구글');
  });

  it('알 수 없는 프로바이더도 크래시 없이 폴백을 돌려준다', () => {
    const config = getProviderConfig('LINE');

    // bg/textColor 가 항상 채워져 있어야 `config.bg` 접근이 안전하다.
    expect(config.bg).toBeTruthy();
    expect(config.textColor).toBeTruthy();
    expect(config.label).toBe('LINE');
    expect(config.icon).toBeNull();
  });
});
