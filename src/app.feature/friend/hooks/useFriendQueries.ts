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

export function useSentFriendRequests(): UseQueryResult<
  FriendRequestSummary[],
  Error
> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.sentRequests(),
    queryFn: () => friendApi.getSentRequests(),
    enabled: isLoggedIn,
    staleTime: FRIEND_STALE_TIME,
  });
}

export function useReceivedFriendRequests(): UseQueryResult<
  FriendRequestSummary[],
  Error
> {
  const isLoggedIn = useIsLoggedIn();
  return useQuery({
    queryKey: FRIEND_QUERY_KEYS.receivedRequests(),
    queryFn: () => friendApi.getReceivedRequests(),
    enabled: isLoggedIn,
    staleTime: FRIEND_STALE_TIME,
  });
}
