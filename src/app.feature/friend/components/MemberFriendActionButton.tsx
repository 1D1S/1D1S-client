'use client';

import { Button, Text } from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { ConfirmDialog } from '@feature/member/settings/components/ConfirmDialog';
import { notifyApiError } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { Check, Clock, UserMinus, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from '../hooks/useFriendMutations';
import {
  useFriendList,
  useFriendRelation,
  useReceivedFriendRequests,
  useSentFriendRequests,
} from '../hooks/useFriendQueries';
import type { FriendRelationStatus } from '../type/friend';

interface MemberFriendActionButtonProps {
  memberId: number;
  /**
   * 통합 멤버 프로필 API(`GET /member/profile/{memberId}`)에서 받은 관계 상태.
   * 전달되면 이 값을 표시 우선순위로 사용하며, requestId 가 필요한 액션
   * (REQUEST_SENT 취소, REQUEST_RECEIVED 수락/거절)에 한해서만
   * `useFriendRelation` 호출로 보강한다.
   */
  relationStatus?: FriendRelationStatus;
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
  relationStatus,
}: MemberFriendActionButtonProps): React.ReactElement | null {
  const isLoggedIn = useIsLoggedIn();
  // requestId 가 필요한 상태에서만 보조 호출. 외부 prop 이 없으면 항상 호출.
  const needsRequestId =
    relationStatus === 'REQUEST_SENT' || relationStatus === 'REQUEST_RECEIVED';
  const shouldFetchRelation = relationStatus === undefined || needsRequestId;
  const { data: fetchedRelation, isLoading: isRelationLoading } =
    useFriendRelation(shouldFetchRelation ? memberId : 0);
  const status: FriendRelationStatus | undefined =
    relationStatus ?? fetchedRelation?.status;
  // relation 응답이 requestId 를 안 내려주면 취소/수락/거절 버튼이 영구 disabled
  // 가 된다. 보낸/받은 신청 목록에서 memberId 로 requestId 를 보강한다.
  const { data: sentRequests } = useSentFriendRequests(
    status === 'REQUEST_SENT'
  );
  const { data: receivedRequests } = useReceivedFriendRequests(
    status === 'REQUEST_RECEIVED'
  );
  const requestList =
    status === 'REQUEST_SENT'
      ? sentRequests
      : status === 'REQUEST_RECEIVED'
        ? receivedRequests
        : undefined;
  const requestId =
    fetchedRelation?.requestId ??
    requestList?.find((request) => request.memberId === memberId)?.requestId;
  const isLoading = relationStatus === undefined && isRelationLoading;
  // 백엔드 relation 응답이 누락/오타로 FRIEND 분기를 못 탈 때를 위한 fallback.
  // 친구 목록에 있는 회원이면 상태와 무관하게 친구로 간주한다.
  const { data: friendList } = useFriendList();
  const isFriendByList = (friendList ?? []).some(
    (friend) => friend.memberId === memberId
  );

  const sendRequest = useSendFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const removeFriend = useRemoveFriend();

  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const isMutating =
    sendRequest.isPending ||
    cancelRequest.isPending ||
    acceptRequest.isPending ||
    rejectRequest.isPending ||
    removeFriend.isPending;

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading || !status) {
    return (
      <div
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-xl',
          'border border-gray-200 bg-gray-50 px-4'
        )}
        aria-hidden
      >
        <Text size="body2" weight="medium" className="text-gray-400">
          불러오는 중...
        </Text>
      </div>
    );
  }

  if (status === 'SELF' || status === 'BLOCKED' || status === 'BLOCKED_BY') {
    return null;
  }

  if (status === 'FRIEND' || isFriendByList) {
    return (
      <>
        <Button
          variant="secondary"
          size="md"
          iconLeft={<Check className="h-4 w-4" />}
          disabled={isMutating}
          onClick={() => setIsRemoveDialogOpen(true)}
        >
          친구
        </Button>
        <ConfirmDialog
          open={isRemoveDialogOpen}
          onOpenChange={setIsRemoveDialogOpen}
          tone="danger"
          icon="Close"
          title="친구를 삭제하시겠어요?"
          description="친구 목록에서 제거됩니다."
          confirmLabel="삭제"
          pendingLabel="삭제 중..."
          isPending={removeFriend.isPending}
          isDisabled={isMutating}
          onCancel={() => setIsRemoveDialogOpen(false)}
          onConfirm={() => {
            removeFriend.mutate(memberId, {
              onSuccess: () => {
                toast.success('친구가 삭제되었습니다.');
                setIsRemoveDialogOpen(false);
              },
              onError: notifyApiError,
            });
          }}
        />
      </>
    );
  }

  if (status === 'REQUEST_SENT') {
    return (
      <Button
        variant="secondary"
        size="md"
        iconLeft={<Clock className="h-4 w-4" />}
        disabled={isMutating || !requestId}
        onClick={() => {
          if (!requestId) {
            return;
          }
          cancelRequest.mutate(requestId, {
            onSuccess: () => toast.success('친구 신청을 취소했습니다.'),
            onError: notifyApiError,
          });
        }}
      >
        신청 취소
      </Button>
    );
  }

  if (status === 'REQUEST_RECEIVED') {
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
          variant="secondary"
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
