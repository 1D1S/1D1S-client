import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

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
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.myDiaries({ size }),
    queryFn: () => diaryBoardApi.getMyDiaries(size),
  });
}

// 특정 멤버의 다이어리 목록 조회
export function useMemberDiaries(
  memberId: number,
  size?: number
): UseQueryResult<MyDiariesResponse, Error> {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.memberDiaries(memberId, { size }),
    queryFn: () => diaryBoardApi.getMemberDiaries(memberId, size),
    enabled: memberId > 0,
  });
}
