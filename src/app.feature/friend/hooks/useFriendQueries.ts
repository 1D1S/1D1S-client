import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { friendApi } from '../api/friendApi';
import { FRIEND_QUERY_KEYS } from '../consts/queryKeys';
import type {
  FriendRelation,
  FriendRequestSummary,
  FriendSummary,
} from '../type/friend';

const FRIEND_STALE_TIME = 1000 * 60; // 1분

export function useFriendList(): UseQueryResult<FriendSummary[], Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.list(),
    queryFn: () => friendApi.getFriends(),
    enabled: isLoggedIn,
    staleTime: FRIEND_STALE_TIME,
  });
}

export function useFriendRelation(
  memberId: number
): UseQueryResult<FriendRelation, Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.relation(memberId),
    queryFn: () => friendApi.getRelation(memberId),
    enabled: isLoggedIn && memberId > 0,
    staleTime: FRIEND_STALE_TIME,
  });
}

export function useSentFriendRequests(
  enabled = true
): UseQueryResult<FriendRequestSummary[], Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.sentRequests(),
    queryFn: () => friendApi.getSentRequests(),
    enabled: isLoggedIn && enabled,
    staleTime: FRIEND_STALE_TIME,
  });
}

export function useReceivedFriendRequests(
  enabled = true
): UseQueryResult<FriendRequestSummary[], Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.receivedRequests(),
    queryFn: () => friendApi.getReceivedRequests(),
    enabled: isLoggedIn && enabled,
    staleTime: FRIEND_STALE_TIME,
  });
}

/** 차단한 회원 목록(차단 관리 화면). 페이지네이션 없음. */
export function useBlockedMembers(): UseQueryResult<FriendSummary[], Error> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.blocked(),
    queryFn: () => friendApi.getBlockedMembers(),
    enabled: isLoggedIn,
    // 전역 기본값(refetchOnMount:false)이라, 다른 화면에서 차단해 invalidate 로
    // stale 만 된 목록이 화면 재진입 시 갱신되지 않는다. 차단 관리 화면은 항상
    // 최신을 보여야 하므로 진입 시 refetch 한다.
    refetchOnMount: 'always',
    staleTime: 0,
  });
}
