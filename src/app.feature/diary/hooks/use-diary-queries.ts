import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { diaryApi } from '../api/diary-api';
import {
  DiaryListParams,
  RandomDiaryParams,
  DiaryDetail,
  DiaryItem,
  DiaryListResponse,
} from '../type/diary';
import { DIARY_QUERY_KEYS } from '../const/query-keys';
export { DIARY_QUERY_KEYS } from '../const/query-keys';

// 다이어리 상세 조회
export function useDiaryDetail(diaryId: number): UseQueryResult<DiaryDetail, Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.detail(diaryId),
    queryFn: () => diaryApi.getDiaryById(diaryId),
    enabled: Boolean(diaryId),
  });
}

// 다이어리 랜덤 조회
export function useRandomDiaries(
  params: RandomDiaryParams = {}
): UseQueryResult<DiaryItem[], Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.random(params),
    queryFn: () => diaryApi.getRandomDiaries(params),
  });
}

// 다이어리 리스트 조회 (무한 스크롤)
export function useDiaryList(
  params: DiaryListParams = {}
): UseInfiniteQueryResult<DiaryListResponse, Error> {
  return useInfiniteQuery({
    queryKey: DIARY_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      diaryApi.getDiaryList({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.nextCursor : undefined,
  });
}

// 모든 다이어리 조회 (페이지네이션 없음)
export function useAllDiaries(): UseQueryResult<DiaryItem[], Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.allDiaries(),
    queryFn: () => diaryApi.getAllDiaries(),
  });
}
