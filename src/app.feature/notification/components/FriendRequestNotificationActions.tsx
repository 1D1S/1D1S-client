'use client';

import { Button } from '@1d1s/design-system';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '@feature/friend/hooks/useFriendMutations';
import { useReceivedFriendRequests } from '@feature/friend/hooks/useFriendQueries';
import { notifyApiError } from '@module/api/errorNotify';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';

interface FriendRequestNotificationActionsProps {
  /** 알림의 actorId — 친구 신청을 보낸 회원 */
  actorId: number;
  /** 알림 ID — 액션 성공 시 읽음 처리에 사용 */
  notificationId: number;
  onMarkAsRead?(id: number): void;
}

/**
 * 친구 신청 알림(FRIEND_REQUEST)에 인라인으로 표시되는 수락/거절 버튼.
 *
 * 알림 페이로드에 requestId가 없어, 받은 친구 신청 목록을 actorId로 매칭해
 * requestId를 찾는다. 이미 수락/거절된 신청이면 매칭 결과가 없으므로
 * 버튼을 렌더링하지 않는다.
 */
export function FriendRequestNotificationActions({
  actorId,
  notificationId,
  onMarkAsRead,
}: FriendRequestNotificationActionsProps): React.ReactElement | null {
  const queryClient = useQueryClient();
  const { data: received } = useReceivedFriendRequests();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();

  const matched = received?.find((request) => request.memberId === actorId);
  const requestId = matched?.requestId;

  if (!requestId) {
    return null;
  }

  const isMutating = acceptRequest.isPending || rejectRequest.isPending;

  const handleSuccess = (message: string) => (): void => {
    toast.success(message);
    onMarkAsRead?.(notificationId);
    void queryClient.invalidateQueries({
      queryKey: NOTIFICATION_QUERY_KEYS.lists(),
    });
    void queryClient.invalidateQueries({
      queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    });
  };

  const handleAccept = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    acceptRequest.mutate(requestId, {
      onSuccess: handleSuccess('친구 신청을 수락했습니다.'),
      onError: notifyApiError,
    });
  };

  const handleReject = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    rejectRequest.mutate(requestId, {
      onSuccess: handleSuccess('친구 신청을 거절했습니다.'),
      onError: notifyApiError,
    });
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        disabled={isMutating}
        onClick={handleAccept}
      >
        수락
      </Button>
      <Button
        variant="outlined"
        size="sm"
        disabled={isMutating}
        onClick={handleReject}
      >
        거절
      </Button>
    </div>
  );
}
