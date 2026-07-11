import { useHasSessionHint } from '@module/hooks/useHasSessionHint';

import { useSidebar } from './useMemberQueries';

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
  // 힌트 변화를 구독한다. 재발급/미들웨어가 세션을 복구해 힌트가 나타나면
  // 즉시 재렌더돼 useSidebar 가 활성화되고, 서버 라운드트립으로 로그인이
  // 확정된다. (하이드레이션 중에는 false → 서버 결과와 일치)
  const hasSessionHint = useHasSessionHint();
  const { data, isLoading, isFetching } = useSidebar();

  return hasSessionHint && (Boolean(data) || isLoading || isFetching);
}
