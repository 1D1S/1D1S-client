import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { CHALLENGE_QUERY_KEYS } from '../../board/consts/queryKeys';
import {
  Participant,
  ParticipantListResponse,
  ParticipantSort,
} from '../../board/type/challenge';
import { challengeDetailApi } from '../api/challengeDetailApi';

// 대기 승인 카드는 페이지네이션 없이 신청자 전원을 한 번에 보여준다.
// ponytail: 신청 대기자는 보통 소수라 단일 페이지로 충분. 100명 초과
// 챌린지가 생기면 무한스크롤로 승격.
const PENDING_FETCH_SIZE = 100;

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

// 호스트 대기 승인 카드용 — 신청 대기(PENDING) 참여자 목록.
// 호스트가 아닐 땐 서버가 빈 페이지를 주므로 enabled 로 호출 자체를 막는다.
export function useChallengePendingParticipants(
  challengeId: number,
  enabled = true
): UseQueryResult<Participant[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.participantList(challengeId, {
      status: ['PENDING'],
      size: PENDING_FETCH_SIZE,
    }),
    queryFn: async () => {
      const response = await challengeDetailApi.getParticipants(challengeId, {
        status: ['PENDING'],
        size: PENDING_FETCH_SIZE,
      });
      return response.items;
    },
    enabled: enabled && Boolean(challengeId),
  });
}
