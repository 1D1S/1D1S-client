'use client';

import { authApi } from '@feature/auth/api/authApi';
import { authStorage } from '@module/utils/auth';
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
  const lastRefreshAtRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    const tryRefresh = async (): Promise<void> => {
      if (isRefreshingRef.current) {
        return;
      }
      if (!authStorage.hasTokens()) {
        return;
      }

      const now = Date.now();
      if (now - lastRefreshAtRef.current < MIN_REFRESH_INTERVAL_MS) {
        return;
      }

      isRefreshingRef.current = true;
      try {
        await authApi.refreshToken();
        lastRefreshAtRef.current = Date.now();
        // 새 토큰으로 재요청되도록 모든 쿼리를 stale 처리. activeOnly: 화면에
        // 마운트된 쿼리만 즉시 refetch 되고, 백그라운드 쿼리는 다음 사용 때
        // 갱신된다.
        await queryClient.invalidateQueries();
      } catch {
        // 재발급 실패는 다음 API 호출에서 401 → silentAuthClient/interceptor
        // 흐름으로 자연스럽게 정리되도록 두고, 여기선 추가 처리를 하지 않는다.
      } finally {
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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);
}
