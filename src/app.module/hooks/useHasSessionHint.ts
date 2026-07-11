import { authStorage } from '@module/utils/auth';
import { useSyncExternalStore } from 'react';

// 콜드 PWA(사파리 홈화면 앱) 런치에서 cookie/localStorage 복원이 한 박자 늦으면
// 첫 스냅샷이 false 로 굳는다. mount 직후 짧게 재확인해 뒤늦게 나타난 힌트를
// 반영한다. (markAuthenticated 를 거치지 않고 OS/미들웨어가 심은 쿠키 대비)
const COLD_START_RECHECK_MS = 150;
const COLD_START_MAX_ATTEMPTS = 6;

/**
 * 로그인 힌트(hasTokens) 변화를 구독한다.
 *
 * 힌트는 JS 에서 반응형이 아니라, 미들웨어/재발급이 세션을 복구해도(=힌트 set)
 * 이를 읽는 컴포넌트가 저절로 re-render 되지 않았다. 그 결과 useSidebar 의
 * enabled(=hasTokens) 가 재평가되지 않아 전체 새로고침(=미들웨어 재실행) 전까지
 * 로그아웃처럼 보였다. SPA 이동은 미들웨어를 타지 않아 고착됐다.
 *
 * 이 hook 은 authStorage 변경 이벤트 + focus/pageshow/visibility + 콜드스타트
 * 폴링을 구독원으로 삼아, 힌트가 나타나는 즉시 재렌더 → useSidebar 재활성화 →
 * 서버 라운드트립(사이드바)으로 로그인 확정되게 한다.
 *
 * SSR/하이드레이션 중에는 getServerSnapshot 이 false 를 돌려주어 서버 결과와
 * 어긋나지 않는다(기존 hasMounted 게이팅과 동일).
 */
function subscribe(onChange: () => void): () => void {
  const unsubscribeStore = authStorage.subscribe(onChange);

  const onVisibility = (): void => {
    if (document.visibilityState === 'visible') {
      onChange();
    }
  };
  window.addEventListener('focus', onChange);
  window.addEventListener('pageshow', onChange);
  document.addEventListener('visibilitychange', onVisibility);

  let attempts = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const recheck = (): void => {
    attempts += 1;
    if (authStorage.hasTokens()) {
      onChange();
      return;
    }
    if (attempts < COLD_START_MAX_ATTEMPTS) {
      timer = setTimeout(recheck, COLD_START_RECHECK_MS);
    }
  };
  if (!authStorage.hasTokens()) {
    timer = setTimeout(recheck, COLD_START_RECHECK_MS);
  }

  return () => {
    unsubscribeStore();
    window.removeEventListener('focus', onChange);
    window.removeEventListener('pageshow', onChange);
    document.removeEventListener('visibilitychange', onVisibility);
    if (timer) {
      clearTimeout(timer);
    }
  };
}

export function useHasSessionHint(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => authStorage.hasTokens(),
    () => false
  );
}
