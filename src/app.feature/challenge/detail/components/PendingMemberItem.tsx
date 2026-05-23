'use client';

import { Button, CircleAvatar, Tag, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Check, X } from 'lucide-react';
import React from 'react';

interface PendingMemberItemProps {
  name: string;
  joinedAt: string;
  profileImg?: string | null;
  onProfileClick?(): void;
  onAccept(): void;
  onReject(): void;
  isLoading: boolean;
}

export function PendingMemberItem({
  name,
  joinedAt,
  profileImg,
  onProfileClick,
  onAccept,
  onReject,
  isLoading,
}: PendingMemberItemProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl',
        'border border-gray-200 bg-white px-3.5 py-3'
      )}
    >
      <button
        type="button"
        onClick={onProfileClick}
        disabled={!onProfileClick}
        aria-label={`${name} 프로필 보기`}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 rounded-lg',
          '-mx-1 -my-1 px-1 py-1 text-left transition-colors',
          'hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent'
        )}
      >
        <CircleAvatar
          size="md"
          imageUrl={profileImg ?? undefined}
          tone="cream"
        />
        <div className="flex min-w-0 flex-col items-start gap-1">
          <Text size="body2" weight="bold" className="truncate text-gray-900">
            {name}
          </Text>
          <Tag tone="gray" size="xs">
            {joinedAt}
          </Tag>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="primary"
          size="icon"
          aria-label="참여 승인"
          onClick={onAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="참여 거절"
          onClick={onReject}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
