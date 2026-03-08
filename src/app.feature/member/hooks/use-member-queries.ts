import { authStorage } from '@module/utils/auth';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { memberApi } from '../api/member-api';
import { MEMBER_QUERY_KEYS } from '../consts/query-keys';
import type { MyPageData, SidebarData } from '../type/member';

const SIDEBAR_CACHE_KEY = '1d1s:sidebar';

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
      setCachedSidebar(data);
      return data;
    },
    enabled: authStorage.hasTokens(),
    placeholderData: cachedSidebar,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    gcTime: 1000 * 60 * 30,
  });
}

export function useMyPage(): UseQueryResult<MyPageData, Error> {
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.myPage(),
    queryFn: () => memberApi.getMyPage(),
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
  });
}
