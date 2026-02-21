import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { diaryDetailApi } from '../../detail/api/diary-detail-api';
import { diaryBoardApi } from '../api/diary-board-api';
import { DIARY_QUERY_KEYS } from '../consts/query-keys';
import {
  DiaryDetail,
  DiaryItem,
  DiaryListParams,
  DiaryListResponse,
  RandomDiaryParams,
} from '../type/diary';

// 다이어리 상세 조회
export function useDiaryDetail(
  diaryId: number
): UseQueryResult<DiaryDetail, Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.detail(diaryId),
    queryFn: () => diaryDetailApi.getDiaryById(diaryId),
    enabled: Boolean(diaryId),
  });
}

// 다이어리 랜덤 조회
export function useRandomDiaries(
  params: RandomDiaryParams = {}
): UseQueryResult<DiaryItem[], Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.random(params),
    queryFn: () => diaryBoardApi.getRandomDiaries(params),
  });
}

// 다이어리 리스트 조회 (무한 스크롤)
export function useDiaryList(
  params: DiaryListParams = {}
): UseInfiniteQueryResult<DiaryListResponse, Error> {
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
  });
}

// 모든 다이어리 조회 (페이지네이션 없음)
export function useAllDiaries(): UseQueryResult<DiaryItem[], Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.allDiaries(),
    queryFn: () => diaryBoardApi.getAllDiaries(),
  });
}
