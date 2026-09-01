import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { FRESH_ON_RETURN } from '@/app.lib/refetchPolicy';

import { useIsLoggedIn } from '../../../member/hooks/useIsLoggedIn';
import { challengeDetailApi } from '../../detail/api/challengeDetailApi';
import { challengeBoardApi } from '../api/challengeBoardApi';
import { CHALLENGE_QUERY_KEYS } from '../consts/queryKeys';
import {
  ChallengeDetailResponse,
  ChallengeListItem,
  ChallengeListParams,
  ChallengeListResponse,
  MyChallengeItem,
  MyChallengeScope,
  RandomChallengesParams,
} from '../type/challenge';

// 내 챌린지 전체보기(self) — 참여 이력 전체(종료·과거참여 포함).
// 마이페이지 요약(useMyPage.challengeList)은 진행중 프리뷰라 별개다.
export function useMyChallenges(
  scope: MyChallengeScope = 'ALL'
): UseQueryResult<MyChallengeItem[], Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.myChallenges(scope),
    queryFn: () => challengeBoardApi.getMyChallenges(scope),
    enabled: isLoggedIn,
  });
}

// 특정 멤버가 참여 중인 챌린지 전체 목록
export function useMemberChallenges(
  memberId: number
): UseQueryResult<ChallengeListItem[], Error> {
  return useQuery({
    queryKey: CHALLENGE_QUERY_KEYS.memberChallenges({ memberId }),
    queryFn: () => challengeBoardApi.getMemberChallenges({ memberId }),
    enabled: memberId > 0,
  });
}

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
    ...FRESH_ON_RETURN,
  });
}

// 챌린지 리스트 불러오기 (무한 스크롤)
export function useChallengeList(
  params: ChallengeListParams = {},
  /**
   * 서버가 같은 조건으로 미리 읽어 둔 첫 페이지. 있으면 로딩 없이 그 목록을
   * 그대로 그리고 백그라운드에서 다시 받는다(initialDataUpdatedAt: 0).
   * **조건이 다른 필터에는 넘기면 안 된다** — 다른 목록이 잠깐 보인다.
   */
  initialPage?: ChallengeListResponse
): UseInfiniteQueryResult<InfiniteData<ChallengeListResponse>, Error> {
  return useInfiniteQuery({
    queryKey: CHALLENGE_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      challengeBoardApi.getChallengeList({
        ...params,
        cursor: pageParam,
      }),
    ...(initialPage
      ? {
          initialData: {
            pages: [initialPage],
            pageParams: [undefined as string | undefined],
          },
          // 0 으로 두면 즉시 stale 이라 마운트 직후 조용히 최신화한다.
          initialDataUpdatedAt: 0,
        }
      : {}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const pageInfo = lastPage?.pageInfo;
      return pageInfo?.hasNextPage ? pageInfo.nextCursor : undefined;
    },
    ...FRESH_ON_RETURN,
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
