'use client';

import { useSyncExternalStore } from 'react';

const NATIVE_READY_EVENT = 'native:ready';

function subscribeNativeReady(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(NATIVE_READY_EVENT, callback);
  return () => window.removeEventListener(NATIVE_READY_EVENT, callback);
}

/**
 * 네이티브 피처 가용성(예: isNativeFormCtaAvailable)을 반응형으로 읽는다.
 *
 * 왜 필요한가: `useIsNativeApp` 의 스냅샷은 "네이티브 여부"(채널/마커 존재)라,
 * JS 채널이 페이지 JS 보다 먼저 주입되면 마운트 시점에 이미 true 다. 그러면
 * 핸드셰이크(`native:ready`)가 `__1D1S_FEATURES__` 를 나중에 채워도 스냅샷이
 * true→true 로 안 바뀌어 리렌더가 안 걸리고, 피처 게이트가 false 로 굳는다.
 *
 * 이 훅은 스냅샷을 **피처 가용성 값 자체**로 삼는다. `native:ready` 때 피처가
 * 채워지면 false→true 로 스냅샷이 바뀌어 리렌더된다. 마운트 시 이미 채워져
 * 있으면 첫 렌더부터 true. SSR/하이드레이션은 항상 false 로 시작해 미스매치가
 * 없고, 하이드레이션 직후 재평가된다.
 *
 * @param check 예: () => isNativeFormCtaAvailable(). 렌더 시 호출되므로
 *   window 를 읽어도 안전한 순수 판정이어야 한다.
 */
export function useNativeCapability(check: () => boolean): boolean {
  return useSyncExternalStore(subscribeNativeReady, check, () => false);
}
