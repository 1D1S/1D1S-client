import { silentAuthClient, tokenClient } from '@module/api/client';
import { isUnauthorizedError } from '@module/api/error';
import { requestData } from '@module/api/request';
import { authStorage } from '@module/utils/auth';
import { isServer, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname } from 'next/navigation';

import { memberApi } from '../api/member-api';
import { MEMBER_QUERY_KEYS } from '../consts/query-keys';
import type { MemberProfileData, MyPageData, SidebarData } from '../type/member';

const AUTH_ROUTE_PREFIXES = ['/login', '/signup', '/auth'];

const SIDEBAR_CACHE_KEY = '1d1s:sidebar';
const MEMBER_INFO_STALE_TIME = Number.POSITIVE_INFINITY;
const MEMBER_INFO_GC_TIME = Number.POSITIVE_INFINITY;

function getCachedSidebar(): SidebarData | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const raw = localStorage.getItem(SIDEBAR_CACHE_KEY);
    return raw ? (JSON.parse(raw) as SidebarData) : undefined;
  } catch {
    return undefined;
  }
}

function setCachedSidebar(data: SidebarData): void {
  try {
    localStorage.setItem(SIDEBAR_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function clearCachedSidebar(): void {
  localStorage.removeItem(SIDEBAR_CACHE_KEY);
}

const isRefreshFailure = (error: unknown): boolean =>
  axios.isAxiosError(error) &&
  (error.response?.status === 401 || error.response?.status === 302);

const logoutAndClearSidebar = (): void => {
  clearCachedSidebar();
  authStorage.clearTokens();
  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/login'
  ) {
    window.location.assign('/login');
  }
};

export function useSidebar(): UseQueryResult<SidebarData | null, Error> {
  const cachedSidebar = getCachedSidebar();
  const pathname = usePathname();

  // 인증 관련 페이지(로그인, 회원가입, OAuth 콜백)에서는 사이드바 쿼리를 실행하지 않음
  // OAuth 콜백 중 /auth/token 호출이 소셜 로그인 세션을 방해할 수 있음
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.sidebar(),
    queryFn: async () => {
      // accessToken(또는 devAccessToken)이 없으면 리프레시 선시도
      if (!authStorage.getAccessToken()) {
        try {
          await tokenClient.get('/auth/token');
        } catch (refreshError) {
          if (isRefreshFailure(refreshError)) {
            logoutAndClearSidebar();
            return null;
          }
          // 네트워크 오류 등은 무시하고 계속 진행
        }
      }

      try {
        // silentAuthClient: 401에서 리다이렉트/토스트 없이 조용히 처리
        // withCredentials로 백엔드 쿠키를 자동 전송 → 응답 결과로 인증 상태 판단
        const data = await requestData<SidebarData>(silentAuthClient, {
          url: '/member/side-bar',
          method: 'GET',
        });
        if (!data) {
          return null;
        }
        authStorage.markAuthenticated();
        setCachedSidebar(data);
        return data;
      } catch (error) {
        if (isUnauthorizedError(error)) {
          // 세션 없음 - 조용히 null 반환 (리다이렉트 없음)
          authStorage.clearTokens();
          return null;
        }
        throw error;
      }
    },
    enabled: !isServer && !isAuthRoute,
    placeholderData: cachedSidebar ?? null,
    staleTime: MEMBER_INFO_STALE_TIME,
    gcTime: MEMBER_INFO_GC_TIME,
  });
}

export function useMemberProfile(
  memberId: number
): UseQueryResult<MemberProfileData, Error> {
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.profile(memberId),
    queryFn: () => memberApi.getMemberProfile(memberId),
    enabled: memberId > 0,
    staleTime: MEMBER_INFO_STALE_TIME,
    gcTime: MEMBER_INFO_GC_TIME,
  });
}

export function useMyPage(): UseQueryResult<MyPageData, Error> {
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.myPage(),
    queryFn: () => memberApi.getMyPage(),
    enabled: authStorage.hasTokens(),
    staleTime: MEMBER_INFO_STALE_TIME,
    gcTime: MEMBER_INFO_GC_TIME,
  });
}
