'use client';

import { Button, Text } from '@1d1s/design-system';
import EmptyState from '@component/EmptyState';
import { SubPageShell } from '@component/layout/SubPageShell';
import { FriendRequestListSkeleton } from '@component/skeletons/ListItemSkeleton';
import { normalizeApiError } from '@module/api/error';
import { notifyApiError } from '@module/api/errorNotify';
import { toast } from '@module/providers/toast';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React from 'react';

import { FriendRequestListItem } from '../components/FriendRequestListItem';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '../hooks/useFriendMutations';
import { useReceivedFriendRequests } from '../hooks/useFriendQueries';

export default function ReceivedFriendRequestsScreen(): React.ReactElement {
  const { data, isLoading, isError, error } = useReceivedFriendRequests();
  const showSkeleton = useMinimumLoading(isLoading);
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();

  const requests = data ?? [];
  const isMutating = acceptRequest.isPending || rejectRequest.isPending;

  const handleAccept = (requestId: number): void => {
    acceptRequest.mutate(requestId, {
      onSuccess: () => toast.success('친구 신청을 수락했습니다.'),
      onError: notifyApiError,
    });
  };

  const handleReject = (requestId: number, nickname: string): void => {
    if (!window.confirm(`'${nickname}'님의 친구 신청을 거절할까요?`)) {
      return;
    }
    rejectRequest.mutate(requestId, {
      onSuccess: () => toast.success('친구 신청을 거절했습니다.'),
      onError: notifyApiError,
    });
  };

  return (
    <SubPageShell title="받은 친구 신청">
      {showSkeleton ? (
        <FriendRequestListSkeleton count={4} actionCount={2} />
      ) : (
        <section
          className={cn(
            'overflow-hidden rounded-[14px] border border-gray-200 bg-white',
            'data-fade-in'
          )}
        >
          {isError ? (
            <div className="flex w-full justify-center py-10">
              <Text size="body2" className="text-red-500">
                {error
                  ? normalizeApiError(error).message
                  : '받은 친구 신청을 불러오지 못했습니다.'}
              </Text>
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              variant="friends"
              title="받은 친구 신청이 없어요"
              className="py-10"
            />
          ) : (
            requests.map((request, idx) => (
              <React.Fragment key={request.requestId}>
                {idx > 0 ? <div className="ml-16 h-px bg-gray-100" /> : null}
                <FriendRequestListItem
                  request={request}
                  actions={
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleAccept(request.requestId)}
                      >
                        수락
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isMutating}
                        onClick={() =>
                          handleReject(request.requestId, request.nickname)
                        }
                      >
                        거절
                      </Button>
                    </>
                  }
                />
              </React.Fragment>
            ))
          )}
        </section>
      )}
    </SubPageShell>
  );
}
