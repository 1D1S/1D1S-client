import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { challengeDetailApi } from '../../detail/api/challenge-detail-api';
import { challengeBoardApi } from '../api/challenge-board-api';
import { CHALLENGE_QUERY_KEYS } from '../consts/query-keys';
import {
  ChallengeDetailResponse,
  ChallengeListItem,
  ChallengeListParams,
  ChallengeListResponse,
  MemberChallengesParams,
  RandomChallengesParams,
} from '../type/challenge';

// 챌린지 상세 조회
export function useChallengeDetail(
  challengeId: number
): UseQueryResult<ChallengeDetailResponse, Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
    queryFn: () => challengeDetailApi.getChallengeDetail(challengeId),
    enabled: Boolean(challengeId),
  });
}

// 챌린지 랜덤 불러오기
export function useRandomChallenges(
  params: RandomChallengesParams = {}
): UseQueryResult<ChallengeListItem[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.random(params),
    queryFn: () => challengeBoardApi.getRandomChallenges(params),
  });
}

// 챌린지 리스트 불러오기 (무한 스크롤)
export function useChallengeList(
  params: ChallengeListParams = {}
): UseInfiniteQueryResult<ChallengeListResponse, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      challengeBoardApi.getChallengeList({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.nextCursor : undefined,
  });
}

// 특정 멤버가 진행중인 챌린지 보기
export function useMemberChallenges(
  params: MemberChallengesParams
): UseQueryResult<ChallengeListItem[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.memberChallenges(params),
    queryFn: () => challengeBoardApi.getMemberChallenges(params),
    enabled: Boolean(params.memberId),
  });
}
