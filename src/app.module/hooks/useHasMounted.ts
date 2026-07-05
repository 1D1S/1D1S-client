import { useSyncExternalStore } from 'react';

/**
 * `useSyncExternalStore` 용 no-op subscribe.
 * 외부 변경 구독이 필요 없고 스냅샷만 SSR-safe 하게 읽을 때 공유한다.
 */
export const NOOP_SUBSCRIBE = (): (() => void) => () => {};

/**
 * SSR + 하이드레이션 안전한 mount 감지 hook.
 *
 * - 서버 렌더: false
 * - 클라이언트 첫 렌더(hydration 도중): false  ← 서버 결과와 동일하게 맞춤
 * - 하이드레이션 완료 후 commit: true
 *
 * 클라이언트 전용 소스(cookies, localStorage, 브라우저 query cache 등)에서
 * 읽은 값을 직접 렌더하면 서버 결과와 어긋나 hydration mismatch 가 발생한다.
 * 그런 값을 그릴 때는 이 hook 으로 mount 이전엔 서버와 같은 fallback 을
 * 그리도록 가드한다.
 *
 * 예) `const value = hasMounted ? clientOnlyValue : fallback;`
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );
}
