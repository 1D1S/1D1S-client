'use client';

import { useSyncExternalStore } from 'react';

export type MobilePlatform = 'ios' | 'android';

const IOS_PATTERN = /iPad|iPhone|iPod/;
const ANDROID_PATTERN = /Android/;

function detect(): MobilePlatform | null {
  if (typeof navigator === 'undefined') {
    return null;
  }
  const userAgent = navigator.userAgent;
  if (ANDROID_PATTERN.test(userAgent)) {
    return 'android';
  }
  // iPadOS 13+ 는 데스크톱 Safari 로 위장한다 — 터치 지원 Mac 으로 가른다.
  const isIpadOs =
    userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return IOS_PATTERN.test(userAgent) || isIpadOs ? 'ios' : null;
}

/**
 * 홈 화면에 설치된 PWA 로 실행 중인가.
 *
 * 이미 홈 화면에서 여는 사용자에게 "앱을 받으세요" 는 소음이다.
 * standalone 은 iOS Safari 의 비표준 속성이라 둘 다 본다.
 */
function isStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return (
    iosStandalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

// UA 와 display-mode 는 페이지 수명 동안 바뀌지 않는다 — 구독할 것이 없다.
function subscribe(): () => void {
  return () => {};
}

/**
 * 모바일 브라우저 플랫폼. 데스크톱·PWA standalone·SSR 이면 null.
 *
 * SSR 스냅샷을 null 로 두어 하이드레이션 미스매치를 피한다 — 앱 유도는
 * 첫 페인트에 있어야 할 UI 가 아니라, 하이드레이션 뒤에 나타나도 된다.
 */
export function useMobilePlatform(): MobilePlatform | null {
  return useSyncExternalStore(
    subscribe,
    () => (isStandalone() ? null : detect()),
    () => null
  );
}
