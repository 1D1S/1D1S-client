'use client';

import { Button, Text } from '@1d1s/design-system';
import { normalizeApiError, notifyApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import React from 'react';
import { toast } from 'sonner';

import { FriendPageShell } from '../components/FriendPageShell';
import { FriendRequestListItem } from '../components/FriendRequestListItem';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '../hooks/useFriendMutations';
import { useReceivedFriendRequests } from '../hooks/useFriendQueries';

export default function ReceivedFriendRequestsScreen(): React.ReactElement {
  const { data, isLoading, isError, error } = useReceivedFriendRequests();
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
    <FriendPageShell title="받은 친구 신청">
      <section
        className={cn(
          'mt-3 overflow-hidden border-y border-gray-100 bg-white',
          'lg:mt-6 lg:rounded-[14px] lg:border',
        )}
      >
        {isLoading ? (
          <div className="flex w-full justify-center py-10">
            <Text size="body2" className="text-gray-500">
              불러오는 중입니다.
            </Text>
          </div>
        ) : isError ? (
          <div className="flex w-full justify-center py-10">
            <Text size="body2" className="text-red-500">
              {error
                ? normalizeApiError(error).message
                : '받은 친구 신청을 불러오지 못했습니다.'}
            </Text>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex w-full justify-center py-10">
            <Text size="body2" className="text-gray-500">
              받은 친구 신청이 없습니다.
            </Text>
          </div>
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
                      variant="outlined"
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
    </FriendPageShell>
  );
}
