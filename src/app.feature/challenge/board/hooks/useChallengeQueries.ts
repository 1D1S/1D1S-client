import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { challengeDetailApi } from '../../detail/api/challengeDetailApi';
import { challengeBoardApi } from '../api/challengeBoardApi';
import { CHALLENGE_QUERY_KEYS } from '../consts/queryKeys';
import {
  ChallengeDetailResponse,
  ChallengeListItem,
  ChallengeListParams,
  ChallengeListResponse,
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
): UseInfiniteQueryResult<
  InfiniteData<{ data: ChallengeListResponse; message: string }>,
  Error
> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      challengeBoardApi.getChallengeList({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.data?.pageInfo;
      return pageInfo?.hasNextPage ? pageInfo.nextCursor : undefined;
    },
  });
}

// 특정 챌린지의 3일 이내 일지 작성 날짜 목록 조회
export function useChallengeCheckWriteDates(
  challengeId: number,
  enabled = true
): UseQueryResult<string[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.checkWrite(challengeId),
    queryFn: () => challengeBoardApi.getChallengeCheckWriteDates(challengeId),
    enabled: enabled && Boolean(challengeId),
  });
}
