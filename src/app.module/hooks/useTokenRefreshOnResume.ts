'use client';

import { refreshAccessTokenOnce } from '@module/api/tokenRefresh';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// PWA / 모바일 브라우저에서 앱이 백그라운드에 있다가 재개될 때 access 토큰이
// 만료된 채로 첫 API 호출이 익명 응답을 받는 문제가 있다. (좋아요 정보 등이
// 로그인 상태 기준으로 내려와야 하는데, 백엔드가 만료 토큰을 401 대신 200
// 익명 응답으로 처리하면 axios 인터셉터의 재발급 흐름이 트리거되지 않는다.)
//
// 이 훅은 문서가 visible 상태로 전환되거나 bfcache 에서 복귀할 때 선제적으로
// /auth/token 을 호출해 access 토큰을 갱신하고, 갱신이 성공하면 모든 쿼리를
// 무효화해 새 토큰으로 재요청되도록 한다.
const MIN_REFRESH_INTERVAL_MS = 60_000;

export function useTokenRefreshOnResume(): void {
  const queryClient = useQueryClient();
  // 초기값 0 — 첫 마운트 시 throttle 에 걸리지 않고 즉시 refresh 가
  // 시도되도록 한다. 이전엔 `Date.now()` 로 초기화돼 첫 이벤트가 모두
  // 60 초 throttle 에 막혀 새로 진입한 사용자의 access 토큰이 만료된
  // 상태로 첫 API 가 호출되는 사고가 있었다.
  const lastRefreshAtRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    const tryRefresh = async (): Promise<void> => {
      if (isRefreshingRef.current) {
        return;
      }
      // hasTokens() 가 false 여도 probe 한다. Safari ITP 는 httpOnly 세션 토큰은
      // 남기고 JS 로 쓴 힌트(쿠키/localStorage)만 퇴출시키므로, 힌트만 보고
      // 게이팅하면 세션이 살아있는데도 게스트로 굳어 스스로 복구하지 못한다.
      // refreshToken() 이 성공하면 markAuthenticated() 로 힌트가 복구된다.
      // 진짜 게스트는 401 → catch 로 흡수되고, 아래 throttle 로 60초당 1회로
      // 제한된다.

      const now = Date.now();
      if (now - lastRefreshAtRef.current < MIN_REFRESH_INTERVAL_MS) {
        return;
      }

      isRefreshingRef.current = true;
      try {
        await refreshAccessTokenOnce();
        // 새 토큰으로 재요청되도록 모든 쿼리를 stale 처리. activeOnly: 화면에
        // 마운트된 쿼리만 즉시 refetch 되고, 백그라운드 쿼리는 다음 사용 때
        // 갱신된다.
        await queryClient.invalidateQueries();
      } catch {
        // 선제 갱신 실패는 조용히 무시한다. 여기서 clearTokens() 하면 연속
        // 새로고침의 회전 레이스에 진 일시적 401(세션은 살아있음)에도 로그인
        // 힌트 쿠키가 지워져, 다음 새로고침에서 미들웨어가 보호 상세를
        // 목록으로 튕겨내는 버그가 있었다. 세션이 정말 만료됐다면 실제 API
        // 경로(사이드바 401 → 재시도 실패 → forceLogout)가 권위 있게 정리한다.
      } finally {
        // 성공/실패 모두 타임스탬프를 갱신해, 힌트 없는 게스트의 반복 probe 도
        // 60초당 1회로 throttle 한다.
        lastRefreshAtRef.current = Date.now();
        isRefreshingRef.current = false;
      }
    };

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        void tryRefresh();
      }
    };

    const handlePageShow = (event: PageTransitionEvent): void => {
      // bfcache 에서 복귀했거나 현재 화면이 보이는 상태면 갱신 시도
      if (event.persisted || document.visibilityState === 'visible') {
        void tryRefresh();
      }
    };

    const handleFocus = (): void => {
      void tryRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);

    // 마운트 직후 선제 갱신 — `pageshow` 이벤트는 listener 등록 전에 이미
    // 발생했을 수 있어 놓치기 쉽다. 또한 보호 라우트(미들웨어가 가드)와 달리
    // 홈/보드 같은 공개 라우트는 SSR 단계에서 access 토큰을 새로 발급하지
    // 않으므로, 클라이언트가 직접 한 번 시도해야 만료 직후의 첫 요청이
    // 실패하는 시나리오를 피할 수 있다.
    void tryRefresh();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);
}
