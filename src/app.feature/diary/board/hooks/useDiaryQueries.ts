import { useAuthStatus } from '@module/hooks/useAuthStatus';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { FRESH_ON_RETURN } from '@/app.lib/refetchPolicy';

import { diaryDetailApi } from '../../detail/api/diaryDetailApi';
import { diaryBoardApi } from '../api/diaryBoardApi';
import { DIARY_QUERY_KEYS } from '../consts/queryKeys';
import {
  DiaryDetail,
  DiaryItem,
  DiaryListParams,
  DiaryListResponse,
  MyDiariesResponse,
  RandomDiaryParams,
} from '../type/diary';

// 다이어리 상세 조회
export function useDiaryDetail(
  diaryId: number,
  options?: {
    enabled?: boolean;
  }
): UseQueryResult<DiaryDetail, Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.detail(diaryId),
    queryFn: () => diaryDetailApi.getDiaryById(diaryId),
    enabled: options?.enabled ?? Boolean(diaryId),
  });
}

// 다이어리 랜덤 조회
export function useRandomDiaries(
  params: RandomDiaryParams = {}
): UseQueryResult<DiaryItem[], Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.random(params),
    queryFn: () => diaryBoardApi.getRandomDiaries(params),
    ...FRESH_ON_RETURN,
  });
}

// 다이어리 리스트 조회 (무한 스크롤)
export function useDiaryList(
  params: DiaryListParams = {}
): UseInfiniteQueryResult<InfiniteData<DiaryListResponse>, Error> {
  return useInfiniteQuery({
    queryKey: DIARY_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      diaryBoardApi.getDiaryList({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.nextCursor : undefined,
    ...FRESH_ON_RETURN,
  });
}

// 모든 다이어리 조회 (페이지네이션 없음)
export function useAllDiaries(options?: {
  enabled?: boolean;
}): UseQueryResult<DiaryItem[], Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.allDiaries(),
    queryFn: () => diaryBoardApi.getAllDiaries(),
    enabled: options?.enabled ?? true,
  });
}

// 나의 다이어리 목록 조회
export function useMyDiaries(
  size?: number
): UseQueryResult<MyDiariesResponse, Error> {
  // 서버가 확인한 authenticated 에서만 조회. hasTokens(JS 힌트)는 비반응형이라
  // 세션 복구 후 재평가되지 않고, Safari PWA 콜드 스타트엔 힌트가 없어 영영
  // 비활성화됐다. (로그아웃 상태 AUTH-002 방지는 그대로 유지)
  const status = useAuthStatus();
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.myDiaries({ size }),
    queryFn: () => diaryBoardApi.getMyDiaries({ size }),
    enabled: status === 'authenticated',
  });
}

// 나의 다이어리 목록 조회 (무한 스크롤)
export function useMyDiariesInfinite(
  size?: number
): UseInfiniteQueryResult<InfiniteData<MyDiariesResponse>, Error> {
  return useInfiniteQuery({
    queryKey: DIARY_QUERY_KEYS.myDiariesInfinite({ size }),
    queryFn: ({ pageParam }) =>
      diaryBoardApi.getMyDiaries({ page: pageParam, size }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.page + 1 : undefined,
  });
}
