'use client';

import { useSyncExternalStore } from 'react';

// SSR UA 매칭이 실패하더라도 chrome 이 겹쳐 보이지 않도록 클라이언트에서
// 다시 한 번 네이티브 쉘 여부를 판정한다. 신호 우선순위:
//
// 1. window.__IS_NATIVE_APP__ — Flutter handshake 가 명시적으로 세팅.
// 2. window.OneDayOneStreakNative — JS 채널 존재. addJavaScriptChannel
//    이 첫 loadRequest 이전에 등록되므로 페이지 JS 가 깨는 순간 이미
//    존재한다. 가장 빠른 신호.
// 3. navigator.userAgent — 토큰 `1D1S-App` 매칭. 채널/마커가 모두 없는
//    임시 환경(예: 브라우저 devtools UA 스푸핑) 에 대한 보조.

const NATIVE_APP_UA_PATTERN = /1D1S-App/i;
const NATIVE_READY_EVENT = 'native:ready';

interface NativeWindow {
  __IS_NATIVE_APP__?: boolean;
  OneDayOneStreakNative?: unknown;
}

function detect(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const win = window as Window & NativeWindow;
  if (win.__IS_NATIVE_APP__) {
    return true;
  }
  if (typeof win.OneDayOneStreakNative !== 'undefined') {
    return true;
  }
  if (
    typeof navigator !== 'undefined' &&
    NATIVE_APP_UA_PATTERN.test(navigator.userAgent)
  ) {
    return true;
  }
  return false;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(NATIVE_READY_EVENT, callback);
  return () => window.removeEventListener(NATIVE_READY_EVENT, callback);
}

/**
 * SSR 단계의 user-agent 판정값을 받아 클라이언트 감지 결과와 OR 한다.
 *
 * - SSR 렌더 시: 항상 `serverValue` 를 반환해 hydration 미스매치 없이
 *   서버 HTML 과 동일한 첫 페인트를 보장한다.
 * - 하이드레이션 직후: `useSyncExternalStore` 가 클라이언트 스냅샷을 다시
 *   읽어 채널/마커/UA 가 있으면 true 로 전환 → 다음 프레임에 chrome 이
 *   제거된다.
 * - 페이지 로드 후 Flutter handshake 가 늦게 들어와도 `native:ready`
 *   이벤트를 받아 다시 평가한다.
 */
export function useIsNativeApp(serverValue: boolean): boolean {
  const detected = useSyncExternalStore(
    subscribe,
    detect,
    () => serverValue
  );
  return serverValue || detected;
}
