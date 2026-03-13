import { authStorage } from '@module/utils/auth';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { memberApi } from '../api/member-api';
import { MEMBER_QUERY_KEYS } from '../consts/query-keys';
import type { MyPageData, SidebarData } from '../type/member';

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

export function useSidebar(): UseQueryResult<SidebarData, Error> {
  const cachedSidebar = getCachedSidebar();

  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.sidebar(),
    queryFn: async () => {
      const data = await memberApi.getSidebar();
      if (data === undefined || data === null) {
        throw new Error('사이드바 데이터를 불러오지 못했습니다.');
      }
      setCachedSidebar(data);
      return data;
    },
    enabled: authStorage.hasTokens(),
    placeholderData: cachedSidebar,
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
