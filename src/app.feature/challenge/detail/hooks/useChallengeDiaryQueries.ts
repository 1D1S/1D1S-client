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

// 챌린지 일지 목록 조회 (무한 스크롤)
export function useChallengeDiaryListInfinite(
  challengeId: number,
  size?: number
): UseInfiniteQueryResult<InfiniteData<ChallengeDiaryListResponse>, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.diariesInfinite(challengeId, { size }),
    queryFn: ({ pageParam }) =>
      challengeDetailApi.getChallengeDiaries(challengeId, {
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.page + 1 : undefined,
    enabled: Boolean(challengeId),
  });
}
