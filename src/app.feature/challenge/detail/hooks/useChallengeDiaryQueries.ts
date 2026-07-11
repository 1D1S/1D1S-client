import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/queryKeys';
import { challengeDetailApi } from '../api/challengeDetailApi';
import { ChallengeDiaryListResponse } from '../type/challengeDiary';
import { ChallengeStatistics } from '../type/challengeStatistics';

// 통계는 자주 바뀌지 않으므로 5분간 stale 유지.
const CHALLENGE_STATISTICS_STALE_TIME = 5 * 60 * 1000;

export function useChallengeDiaryList(
  challengeId: number,
  size?: number
): UseQueryResult<ChallengeDiaryListResponse, Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.diaries(challengeId, { size }),
    queryFn: () =>
      challengeDetailApi.getChallengeDiaries(challengeId, { size }),
    enabled: Boolean(challengeId),
  });
}

// 챌린지 일지 목록 조회 (무한 스크롤). date 지정 시 그 날짜 일지만.
export function useChallengeDiaryListInfinite(
  challengeId: number,
  size?: number,
  date?: string
): UseInfiniteQueryResult<InfiniteData<ChallengeDiaryListResponse>, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.diariesInfinite(challengeId, { size, date }),
    queryFn: ({ pageParam }) =>
      challengeDetailApi.getChallengeDiaries(challengeId, {
        page: pageParam,
        size,
        date,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.page + 1 : undefined,
    enabled: Boolean(challengeId),
  });
}

// 챌린지 통계 조회 (참여율/완료 목표수/일자별 일지 추이)
export function useChallengeStatistics(
  challengeId: number
): UseQueryResult<ChallengeStatistics, Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.statistics(challengeId),
    queryFn: () => challengeDetailApi.getChallengeStatistics(challengeId),
    enabled: Boolean(challengeId),
    staleTime: CHALLENGE_STATISTICS_STALE_TIME,
  });
}
