'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { getDateTimestamp } from '@module/utils/date';
import { requestNativePushRoute } from '@module/utils/nativeBridge';
import { useRouter } from 'next/navigation';
import React from 'react';

import type { FriendRequestSummary } from '../type/friend';

interface FriendRequestListItemProps {
  request: FriendRequestSummary;
  actions: React.ReactNode;
}

export function FriendRequestListItem({
  request,
  actions,
}: FriendRequestListItemProps): React.ReactElement {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'transition-colors hover:bg-gray-50'
      )}
    >
      <button
        type="button"
        onClick={() => {
          const path = `/member/${request.memberId}`;
          if (!requestNativePushRoute(path)) {
            router.push(path);
          }
        }}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <CircleAvatar size="md" imageUrl={request.profileUrl} tone="peach" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Text size="body1" weight="medium" className="truncate text-gray-900">
            {request.nickname}
          </Text>
          {request.createdAt ? (
            <Text size="caption2" className="text-gray-400">
              {new Date(getDateTimestamp(request.createdAt)).toLocaleDateString(
                'ko-KR'
              )}
            </Text>
          ) : null}
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  );
}
