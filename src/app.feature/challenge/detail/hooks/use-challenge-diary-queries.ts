import { DiaryListResponse } from '@feature/diary/board/type/diary';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/query-keys';
import { challengeDetailApi } from '../api/challenge-detail-api';

interface ChallengeDiaryListParams {
  size?: number;
}

// 챌린지 일지 목록 조회 (무한 스크롤)
export function useChallengeDiaryList(
  challengeId: number,
  params: ChallengeDiaryListParams = {}
): UseInfiniteQueryResult<InfiniteData<DiaryListResponse>, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.diaries(challengeId, params),
    queryFn: ({ pageParam }) =>
      challengeDetailApi.getChallengeDiaries(challengeId, {
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.nextCursor : undefined,
    enabled: Boolean(challengeId),
  });
}
