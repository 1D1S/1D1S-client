'use client';

import { Button, Text } from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { notifyApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { Check, Clock, UserMinus, UserPlus } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from '../hooks/useFriendMutations';
import { useFriendRelation } from '../hooks/useFriendQueries';

interface MemberFriendActionButtonProps {
  memberId: number;
}

/**
 * 회원 프로필(다른 사람) 페이지의 친구 액션 버튼.
 *
 * 관계 상태(GET /friends/relation/{memberId})에 따라 다른 액션을 노출한다:
 * - NONE → "친구 추가" (POST /friends/request)
 * - REQUEST_SENT → "신청 취소" (DELETE /friends/request/{id})
 * - REQUEST_RECEIVED → "수락" + "거절"
 * - FRIEND → "친구" 라벨 + 호버 시 친구 삭제
 * - BLOCKED / BLOCKED_BY / SELF → 버튼 숨김
 */
export function MemberFriendActionButton({
  memberId,
}: MemberFriendActionButtonProps): React.ReactElement | null {
  const isLoggedIn = useIsLoggedIn();
  const { data: relation, isLoading } = useFriendRelation(memberId);

  const sendRequest = useSendFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const removeFriend = useRemoveFriend();

  const isMutating =
    sendRequest.isPending ||
    cancelRequest.isPending ||
    acceptRequest.isPending ||
    rejectRequest.isPending ||
    removeFriend.isPending;

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading || !relation) {
    return (
      <div
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-xl',
          'border border-gray-200 bg-gray-50 px-4',
        )}
        aria-hidden
      >
        <Text size="body2" weight="medium" className="text-gray-400">
          불러오는 중...
        </Text>
      </div>
    );
  }

  if (
    relation.status === 'SELF' ||
    relation.status === 'BLOCKED' ||
    relation.status === 'BLOCKED_BY'
  ) {
    return null;
  }

  if (relation.status === 'FRIEND') {
    return (
      <Button
        variant="secondary"
        size="md"
        iconLeft={<Check className="h-4 w-4" />}
        disabled={isMutating}
        onClick={() => {
          if (!window.confirm('친구를 삭제하시겠어요?')) {
            return;
          }
          removeFriend.mutate(memberId, {
            onSuccess: () => toast.success('친구가 삭제되었습니다.'),
            onError: notifyApiError,
          });
        }}
      >
        친구
      </Button>
    );
  }

  if (relation.status === 'REQUEST_SENT') {
    return (
      <Button
        variant="secondary"
        size="md"
        iconLeft={<Clock className="h-4 w-4" />}
        disabled={isMutating || !relation.requestId}
        onClick={() => {
          if (!relation.requestId) {
            return;
          }
          cancelRequest.mutate(relation.requestId, {
            onSuccess: () => toast.success('친구 신청을 취소했습니다.'),
            onError: notifyApiError,
          });
        }}
      >
        신청 취소
      </Button>
    );
  }

  if (relation.status === 'REQUEST_RECEIVED') {
    const requestId = relation.requestId;
    const disabled = isMutating || !requestId;
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          disabled={disabled}
          onClick={() => {
            if (!requestId) {
              return;
            }
            acceptRequest.mutate(requestId, {
              onSuccess: () => toast.success('친구 신청을 수락했습니다.'),
              onError: notifyApiError,
            });
          }}
        >
          수락
        </Button>
        <Button
          variant="outlined"
          size="md"
          iconLeft={<UserMinus className="h-4 w-4" />}
          disabled={disabled}
          onClick={() => {
            if (!requestId) {
              return;
            }
            rejectRequest.mutate(requestId, {
              onSuccess: () => toast.success('친구 신청을 거절했습니다.'),
              onError: notifyApiError,
            });
          }}
        >
          거절
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="md"
      iconLeft={<UserPlus className="h-4 w-4" />}
      disabled={isMutating}
      onClick={() => {
        sendRequest.mutate(memberId, {
          onSuccess: () => toast.success('친구 신청을 보냈습니다.'),
          onError: notifyApiError,
        });
      }}
    >
      친구 추가
    </Button>
  );
}
