import { authStorage } from '@module/utils/auth';
import { useSyncExternalStore } from 'react';

import { useSidebar } from './useMemberQueries';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

/**
 * 권위 있는 로그인 상태 판정.
 *
 * - 토큰 힌트가 반드시 있어야 함 (이 값이 false면 항상 비로그인).
 * - 그 위에서 `sidebarData`가 있거나, 아직 응답 전 진행 중이면 잠정 로그인.
 * - 로그아웃/`forceLogout` 시 힌트가 즉시 제거되므로, 캐시된 sidebarData만
 *   남아 있어도 로그인으로 오판하지 않는다.
 *
 * 주의: `authStorage.hasTokens()`는 httpOnly 토큰을 읽지 못해 힌트만으로
 * true를 반환할 수 있으므로, 이동 여부를 결정하는 클릭 핸들러에서는
 * 반드시 이 훅을 사용할 것.
 */
export function useIsLoggedIn(): boolean {
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
  const { data, isLoading, isFetching } = useSidebar();
  const hasTokenHint = hasMounted && authStorage.hasTokens();

  return (
    hasMounted &&
    hasTokenHint &&
    (Boolean(data) || isLoading || isFetching)
  );
}
