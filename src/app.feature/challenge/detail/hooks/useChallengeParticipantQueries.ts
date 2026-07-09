import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/queryKeys';
import {
  ParticipantListResponse,
  ParticipantSort,
} from '../../board/type/challenge';
import { challengeDetailApi } from '../api/challengeDetailApi';

// 챌린지 참여자 목록 조회 (오프셋 페이지네이션 무한 스크롤 + 정렬)
export function useChallengeParticipantsInfinite(
  challengeId: number,
  sort: ParticipantSort,
  size?: number
): UseInfiniteQueryResult<InfiniteData<ParticipantListResponse>, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.participantList(challengeId, { sort, size }),
    queryFn: ({ pageParam }) =>
      challengeDetailApi.getParticipants(challengeId, {
        sort,
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.page + 1 : undefined,
    enabled: Boolean(challengeId),
  });
}
