import { authStorage } from '@module/utils/auth';
import { useSyncExternalStore } from 'react';

import { useSidebar } from './useMemberQueries';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

/**
 * 권위 있는 로그인 상태 판정.
 *
 * - `sidebarData`(useSidebar 응답)가 있으면 로그인 상태로 확정.
 * - 아직 응답 전이어도 토큰 힌트가 있고 요청이 진행 중이면 잠정 로그인으로 판정
 *   (초기 렌더 깜빡임 방지).
 * - 그 외에는 비로그인. stale 힌트 쿠키/플래그만 있고 sidebar 401 이후라면 false.
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
    (Boolean(data) || (hasTokenHint && (isLoading || isFetching)))
  );
}
