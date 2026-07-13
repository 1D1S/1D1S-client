import { useAuthStatus } from '@module/hooks/useAuthStatus';

/**
 * 권위 있는 로그인 여부.
 *
 * 부팅 세션 확인(runAuthBootProbe)·로그인·로그아웃·재발급으로 확정되는
 * authStorage 상태를 그대로 따른다. `unknown`(확인 중)에는 false 를 돌려주므로,
 * 게스트 UI 를 확정 렌더하거나 /login 으로 튕기는 소비자는 이 값 대신
 * `useAuthStatus() === 'guest'` 로 "확정된 게스트" 만 판정해야 깜빡임이 없다.
 * 쿼리 enabled 게이팅에는 이 훅(=authenticated)이 안전하다.
 */
export function useIsLoggedIn(): boolean {
  return useAuthStatus() === 'authenticated';
}
