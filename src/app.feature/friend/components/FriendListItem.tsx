'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
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
  const handleOpenProfile = (): void => {
    router.push(`/member/${friend.memberId}`);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'transition-colors hover:bg-gray-50',
      )}
    >
      <button
        type="button"
        onClick={handleOpenProfile}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <CircleAvatar size="md" imageUrl={friend.profileUrl} tone="peach" />
        <Text
          size="body1"
          weight="medium"
          className="truncate text-gray-900"
        >
          {friend.nickname}
        </Text>
      </button>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
