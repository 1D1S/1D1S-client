import { silentAuthClient, tokenClient } from '@module/api/client';
import { isUnauthorizedError } from '@module/api/error';
import { requestData } from '@module/api/request';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { authStorage } from '@module/utils/auth';
import {
  InfiniteData,
  isServer,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { memberApi } from '../api/memberApi';
import { MEMBER_QUERY_KEYS } from '../consts/queryKeys';
import type {
  MemberProfileData,
  MyPageData,
  SidebarData,
} from '../type/member';
import { useIsLoggedIn } from './useIsLoggedIn';

// 레거시 키: 이전 버전이 localStorage에 사이드바를 캐싱했음. 토큰 만료 시점에
// stale 데이터가 placeholder로 노출되는 문제가 있어 캐시 사용을 중단했지만,
// 기존 사용자 브라우저에 남아 있을 수 있어 로그아웃/401 정리 경로에서는
// 계속 제거한다.
const LEGACY_SIDEBAR_CACHE_KEY = '1d1s:sidebar';
const MEMBER_INFO_STALE_TIME = Number.POSITIVE_INFINITY;
const MEMBER_INFO_GC_TIME = Number.POSITIVE_INFINITY;
const SIDEBAR_MAX_RETRIES = 2;

export function clearCachedSidebar(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(LEGACY_SIDEBAR_CACHE_KEY);
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

export function useSidebar(): UseQueryResult<SidebarData | null, Error> {
  // 부팅 세션 확인이 로그인으로 확정된 뒤에만 프로필을 가져온다. 예전엔
  // hasTokens()(=JS 힌트) 로 게이팅해, 힌트가 소실된 Safari PWA 콜드 스타트에서
  // 사이드바가 영영 비활성화돼 로그인 사용자가 게스트로 굳었다. 이제 힌트 대신
  // 서버가 확인한 authenticated 상태를 게이트로 쓴다.
  const status = useAuthStatus();
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.sidebar(),
    queryFn: async () => {
      const data = await fetchSidebarWithRetry();
      if (data) {
        authStorage.markAuthenticated();
      }
      return data;
    },
    retry: false, // queryFn 내부에서 직접 재시도 처리
    enabled: !isServer && status === 'authenticated',
    // staleTime: Infinity 라 마운트 시 데이터가 stale 이 아니므로
    // refetchOnMount(기본 true)는 어차피 refetch 하지 않는다 — 명시 제거.
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

export function useMemberProfileDiariesInfinite(
  memberId: number,
  size?: number
): UseInfiniteQueryResult<InfiniteData<MemberProfileData>, Error> {
  return useInfiniteQuery({
    queryKey: MEMBER_QUERY_KEYS.profileDiariesInfinite(memberId, { size }),
    queryFn: ({ pageParam }) =>
      memberApi.getMemberProfile(memberId, { page: pageParam, size }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.diaryList?.pageInfo?.hasNextPage
        ? lastPage.diaryList.pageInfo.page + 1
        : undefined,
    enabled: memberId > 0,
  });
}

export function useMyPage(): UseQueryResult<MyPageData, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.myPage(),
    queryFn: () => memberApi.getMyPage(),
    enabled: isLoggedIn,
    // staleTime: Infinity 라 refetchOnMount(기본 true)는 no-op — 명시 제거.
    staleTime: MEMBER_INFO_STALE_TIME,
    gcTime: MEMBER_INFO_GC_TIME,
  });
}
