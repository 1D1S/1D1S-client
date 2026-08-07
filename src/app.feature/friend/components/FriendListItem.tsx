'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { requestNativePushRoute } from '@module/utils/nativeBridge';
import {
  isWithdrawnMember,
  withdrawnDisplayName,
} from '@module/utils/nickname';
import { useRouter } from 'next/navigation';
import React from 'react';

import type { FriendSummary } from '../type/friend';

interface FriendListItemProps {
  friend: FriendSummary;
  action?: React.ReactNode;
}

export function FriendListItem({
  friend,
  action,
}: FriendListItemProps): React.ReactElement {
  const router = useRouter();
  const withdrawn = isWithdrawnMember(friend.nickname);
  const handleOpenProfile = (): void => {
    if (withdrawn) {
      return;
    }
    const path = `/member/${friend.memberId}`;
    if (!requestNativePushRoute(path)) {
      router.push(path);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'transition-colors hover:bg-gray-50'
      )}
    >
      <button
        type="button"
        onClick={handleOpenProfile}
        disabled={withdrawn}
        className={cn(
          'flex flex-1 items-center gap-3 text-left',
          withdrawn && 'cursor-default'
        )}
      >
        <CircleAvatar
          size="md"
          imageUrl={withdrawn ? undefined : friend.profileUrl}
          tone="peach"
        />
        <Text size="body1" weight="medium" className="truncate text-gray-900">
          {withdrawnDisplayName(friend.nickname)}
        </Text>
      </button>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
