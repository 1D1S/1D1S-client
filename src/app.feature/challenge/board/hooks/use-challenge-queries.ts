import {
  useQuery,
  useInfiniteQuery,
  UseQueryResult,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { challengeApi } from '../api/challenge-api';
import {
  ChallengeListParams,
  RandomChallengesParams,
  MemberChallengesParams,
  ChallengeDetailResponse,
  ChallengeListItem,
  ChallengeListResponse,
} from '../type/challenge';
import { CHALLENGE_QUERY_KEYS } from '../const/query-keys';
export { CHALLENGE_QUERY_KEYS } from '../const/query-keys';

// 챌린지 상세 조회
export function useChallengeDetail(
  challengeId: number
): UseQueryResult<ChallengeDetailResponse, Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.detail(challengeId),
    queryFn: () => challengeApi.getChallengeDetail(challengeId),
    enabled: Boolean(challengeId),
  });
}

// 챌린지 랜덤 불러오기
export function useRandomChallenges(
  params: RandomChallengesParams = {}
): UseQueryResult<ChallengeListItem[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.random(params),
    queryFn: () => challengeApi.getRandomChallenges(params),
  });
}

// 챌린지 리스트 불러오기 (무한 스크롤)
export function useChallengeList(
  params: ChallengeListParams = {}
): UseInfiniteQueryResult<ChallengeListResponse, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      challengeApi.getChallengeList({
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
    queryFn: () => challengeApi.getMemberChallenges(params),
    enabled: Boolean(params.memberId),
  });
}
