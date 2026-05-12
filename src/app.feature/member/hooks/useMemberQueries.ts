import { silentAuthClient, tokenClient } from '@module/api/client';
import { isUnauthorizedError } from '@module/api/error';
import { requestData } from '@module/api/request';
import { authStorage } from '@module/utils/auth';
import { isServer, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { memberApi } from '../api/memberApi';
import { MEMBER_QUERY_KEYS } from '../consts/queryKeys';
import type { MemberProfileData, MyPageData, SidebarData } from '../type/member';
import { useIsLoggedIn } from './useIsLoggedIn';

const SIDEBAR_CACHE_KEY = '1d1s:sidebar';
const MEMBER_INFO_STALE_TIME = Number.POSITIVE_INFINITY;
const MEMBER_INFO_GC_TIME = Number.POSITIVE_INFINITY;
const SIDEBAR_MAX_RETRIES = 2;

let cachedSidebarRaw: string | null = null;
let cachedSidebarValue: SidebarData | undefined = undefined;

function getCachedSidebar(): SidebarData | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const raw = localStorage.getItem(SIDEBAR_CACHE_KEY);
    if (raw === cachedSidebarRaw) {
      return cachedSidebarValue;
    }
    cachedSidebarRaw = raw;
    cachedSidebarValue = raw ? (JSON.parse(raw) as SidebarData) : undefined;
    return cachedSidebarValue;
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

/** 백엔드 로그아웃 API 호출 + 로컬 인증 상태 정리 */
async function forceLogout(): Promise<void> {
  try {
    await tokenClient.post('/auth/logout');
  } catch {
    // 로그아웃 API 실패는 무시하고 로컬 상태만 정리
  }
  clearCachedSidebar();
  authStorage.clearTokens();
}

async function fetchSidebar(): Promise<SidebarData> {
  return requestData<SidebarData>(silentAuthClient, {
    url: '/member/side-bar',
    method: 'GET',
  });
}

/**
 * 사이드바 데이터 요청 (최대 3회 시도)
 * - 401: 즉시 포기 → 강제 로그아웃
 * - 기타 오류: 2번 더 재시도 → 모두 실패 시 강제 로그아웃
 */
async function fetchSidebarWithRetry(): Promise<SidebarData | null> {
  for (let attempt = 0; attempt <= SIDEBAR_MAX_RETRIES; attempt++) {
    try {
      const data = await fetchSidebar();
      return data ?? null;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await forceLogout();
        return null;
      }
      // 마지막 시도에서도 실패하면 강제 로그아웃
      if (attempt === SIDEBAR_MAX_RETRIES) {
        await forceLogout();
        return null;
      }
    }
  }
  return null;
}

// localStorage 캐시를 placeholderData로 쓰면 SSR(null)과 CSR 첫 렌더가
// 달라져 hydration mismatch가 발생한다. 서버 스냅샷을 undefined로 고정해
// 첫 렌더 결과를 일치시키고, 하이드레이션 이후에만 캐시를 노출한다.
const subscribeNoop = (): (() => void) => () => undefined;
const getServerSidebarSnapshot = (): SidebarData | undefined => undefined;

export function useSidebar(): UseQueryResult<SidebarData | null, Error> {
  const cachedSidebar = useSyncExternalStore(
    subscribeNoop,
    getCachedSidebar,
    getServerSidebarSnapshot
  );

  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.sidebar(),
    queryFn: async () => {
      const data = await fetchSidebarWithRetry();
      if (data) {
        authStorage.markAuthenticated();
        setCachedSidebar(data);
      }
      return data;
    },
    retry: false, // queryFn 내부에서 직접 재시도 처리
    enabled: !isServer,
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
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.myPage(),
    queryFn: () => memberApi.getMyPage(),
    enabled: isLoggedIn,
    staleTime: MEMBER_INFO_STALE_TIME,
    gcTime: MEMBER_INFO_GC_TIME,
  });
}
