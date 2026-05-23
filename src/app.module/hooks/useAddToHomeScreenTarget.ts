import { useSyncExternalStore } from 'react';

export type AddToHomeBrowser = 'ios-safari' | 'android-chrome';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

const IN_APP_UA_TOKENS = [
  'KAKAOTALK',
  'NAVER(inapp',
  'NAVER(inApp',
  'Instagram',
  'FBAN',
  'FBAV',
  'FB_IAB',
  'Line/',
  'Twitter',
  'DaumApps',
  'Snapchat',
  'everytimeApp',
  'Whale',
];

function detectBrowser(): AddToHomeBrowser | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  if (!isIOS && !isAndroid) {
    return null;
  }

  if (IN_APP_UA_TOKENS.some((token) => ua.includes(token))) {
    return null;
  }

  if (isIOS) {
    if (/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua)) {
      return null;
    }
    if (!/Safari/.test(ua)) {
      return null;
    }
    return 'ios-safari';
  }

  if (/; wv\)/.test(ua)) {
    return null;
  }
  if (/Chrome\//.test(ua) && !/EdgA|OPR\/|SamsungBrowser/.test(ua)) {
    return 'android-chrome';
  }
  return null;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  if (iosStandalone === true) {
    return true;
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(display-mode: standalone)').matches;
  }
  return false;
}

/**
 * 모바일 Safari(iOS) / Chrome(Android) 같은 브라우저에서 접속한 경우에만
 * 어떤 OS 가이드를 보여줄지 식별자를 반환한다. 인앱 웹뷰, 데스크탑, 이미
 * standalone(홈 화면에서 실행됨) 상태인 경우 null 을 반환한다.
 *
 * SSR/CSR 불일치를 막기 위해 마운트 전에는 null 을 반환한다.
 */
export function useAddToHomeScreenTarget(): AddToHomeBrowser | null {
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );

  if (!hasMounted) {
    return null;
  }
  if (isStandaloneDisplay()) {
    return null;
  }
  return detectBrowser();
}
