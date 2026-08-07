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

export function useSendFriendRequest(): UseMutationResult<void, Error, number> {
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

/**
 * 차단/해제 후에는 일지 보드·상세·챌린지 일지·댓글·참여자·프로필 등 여러
 * 피드에서 그 사용자의 콘텐츠가 사라지거나 다시 나타나야 한다. 서버가
 * 필터링하므로 클라는 현재 열려 있는 쿼리를 모두 무효화해 즉시 반영한다.
 */
function useInvalidateAfterBlock(): () => void {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries();
  };
}

export function useBlockMember(): UseMutationResult<void, Error, number> {
  const invalidate = useInvalidateAfterBlock();
  return useMutation({
    mutationFn: (blockedMemberId: number) =>
      friendApi.blockMember(blockedMemberId),
    onSuccess: invalidate,
  });
}

export function useUnblockMember(): UseMutationResult<void, Error, number> {
  const invalidate = useInvalidateAfterBlock();
  return useMutation({
    mutationFn: (blockedMemberId: number) =>
      friendApi.unblockMember(blockedMemberId),
    onSuccess: invalidate,
  });
}
