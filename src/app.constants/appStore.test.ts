import { describe, expect, it } from 'vitest';

import {
  APP_STORE_URL,
  buildAndroidIntentUrl,
  isDeepLinkablePath,
  PLAY_STORE_URL,
} from './appStore';

describe('isDeepLinkablePath', () => {
  it('앱이 intent-filter 로 선언한 두 갈래만 받는다', () => {
    expect(isDeepLinkablePath('/challenge/12')).toBe(true);
    expect(isDeepLinkablePath('/diary/3')).toBe(true);
    // 앱에 없는 경로를 넘기면 앱만 열리고 그 화면으로는 못 간다.
    expect(isDeepLinkablePath('/challenge')).toBe(false);
    expect(isDeepLinkablePath('/challenge/create')).toBe(false);
    expect(isDeepLinkablePath('/mypage')).toBe(false);
    expect(isDeepLinkablePath('/')).toBe(false);
  });
});

describe('buildAndroidIntentUrl', () => {
  it('패키지와 스토어 폴백을 함께 실어 보낸다', () => {
    const url = buildAndroidIntentUrl(
      new URL('https://1day1streak.com/challenge/12?tab=diary')
    );
    expect(url).toContain('intent://1day1streak.com/challenge/12?tab=diary');
    expect(url).toContain('scheme=https');
    expect(url).toContain('package=com.onedayonestreak.app');
    expect(url).toContain(
      `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)}`
    );
    expect(url.endsWith(';end')).toBe(true);
  });
});

describe('스토어 좌표', () => {
  it('iTunes Lookup 으로 확인한 실제 앱을 가리킨다', () => {
    expect(APP_STORE_URL).toContain('id6793538373');
    expect(PLAY_STORE_URL).toContain('id=com.onedayonestreak.app');
    expect(PLAY_STORE_URL).toContain('hl=ko');
  });
});
