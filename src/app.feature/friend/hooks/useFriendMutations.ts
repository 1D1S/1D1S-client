import { MEMBER_QUERY_KEYS } from '@feature/member/consts/queryKeys';
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { friendApi } from '../api/friendApi';
import { FRIEND_QUERY_KEYS } from '../consts/queryKeys';

/**
 * 친구 관련 mutation 후 갱신해야 할 쿼리들을 한 번에 무효화한다.
 * 어떤 액션이든 친구 목록·관계·신청 목록에 영향이 갈 수 있으므로 root 키로
 * 일괄 invalidate 한다. 멤버 프로필 응답에도 `relationStatus` 가 포함되므로
 * 함께 무효화해 화면이 즉시 동기화되도록 한다.
 */
function useInvalidateFriendQueries(): () => void {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: FRIEND_QUERY_KEYS.all });
    void queryClient.invalidateQueries({
      queryKey: MEMBER_QUERY_KEYS.profiles(),
    });
  };
}

export function useSendFriendRequest(): UseMutationResult<
  void,
  Error,
  number
> {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: (toMemberId: number) => friendApi.sendRequest(toMemberId),
    onSuccess: invalidate,
  });
}

export function useAcceptFriendRequest(): UseMutationResult<
  void,
  Error,
  number
> {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: (requestId: number) => friendApi.acceptRequest(requestId),
    onSuccess: invalidate,
  });
}

export function useRejectFriendRequest(): UseMutationResult<
  void,
  Error,
  number
> {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: (requestId: number) => friendApi.rejectRequest(requestId),
    onSuccess: invalidate,
  });
}

export function useCancelFriendRequest(): UseMutationResult<
  void,
  Error,
  number
> {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: (requestId: number) => friendApi.cancelRequest(requestId),
    onSuccess: invalidate,
  });
}

export function useRemoveFriend(): UseMutationResult<void, Error, number> {
  const invalidate = useInvalidateFriendQueries();
  return useMutation({
    mutationFn: (friendMemberId: number) =>
      friendApi.removeFriend(friendMemberId),
    onSuccess: invalidate,
  });
}
