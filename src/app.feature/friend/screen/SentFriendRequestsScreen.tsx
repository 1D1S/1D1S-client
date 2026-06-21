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
import { useCancelFriendRequest } from '../hooks/useFriendMutations';
import { useSentFriendRequests } from '../hooks/useFriendQueries';

export default function SentFriendRequestsScreen(): React.ReactElement {
  const { data, isLoading, isError, error } = useSentFriendRequests();
  const showSkeleton = useMinimumLoading(isLoading);
  const cancelRequest = useCancelFriendRequest();

  const requests = data ?? [];

  const handleCancel = (requestId: number, nickname: string): void => {
    if (!window.confirm(`'${nickname}'님에게 보낸 친구 신청을 취소할까요?`)) {
      return;
    }
    cancelRequest.mutate(requestId, {
      onSuccess: () => toast.success('친구 신청을 취소했습니다.'),
      onError: notifyApiError,
    });
  };

  return (
    <SubPageShell title="보낸 친구 신청">
      {showSkeleton ? (
        <FriendRequestListSkeleton count={4} actionCount={1} />
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
                  : '보낸 친구 신청을 불러오지 못했습니다.'}
              </Text>
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              variant="friends"
              title="보낸 친구 신청이 없어요"
              className="py-10"
            />
          ) : (
            requests.map((request, idx) => (
              <React.Fragment key={request.requestId}>
                {idx > 0 ? <div className="ml-16 h-px bg-gray-100" /> : null}
                <FriendRequestListItem
                  request={request}
                  actions={
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={cancelRequest.isPending}
                      onClick={() =>
                        handleCancel(request.requestId, request.nickname)
                      }
                    >
                      취소
                    </Button>
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
