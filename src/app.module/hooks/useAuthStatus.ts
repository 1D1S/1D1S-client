import { type AuthStatus,authStorage } from '@module/utils/auth';
import { useSyncExternalStore } from 'react';

/**
 * 권위 있는 로그인 상태(unknown/authenticated/guest)를 구독한다.
 *
 * 상태는 markAuthenticated/clearTokens/settleGuest 로만 바뀌며 그때마다 통지되어,
 * 부팅 세션 확인(runAuthBootProbe)·로그인·로그아웃·재발급 성공이 즉시 UI 에
 * 반영된다. 힌트(쿠키/localStorage) 존재 여부에 의존하지 않으므로 Safari
 * standalone PWA 콜드 스타트에서도 로그인 사용자가 게스트로 굳지 않는다.
 *
 * SSR/하이드레이션 중에는 getServerSnapshot 이 'unknown' 을 돌려주어 서버 출력과
 * 어긋나지 않는다. 소비자는 'unknown' 을 "확인 중(스켈레톤)" 으로 렌더하고,
 * 로그인/로그아웃 UI 는 'authenticated'/'guest' 로 확정된 뒤에만 그린다.
 */
export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(
    authStorage.subscribe,
    () => authStorage.getStatus(),
    () => 'unknown'
  );
}
