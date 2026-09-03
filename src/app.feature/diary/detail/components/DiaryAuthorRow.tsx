'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { requestNativePushRoute } from '@module/utils/nativeBridge';
import {
  isWithdrawnMember,
  WITHDRAWN_MEMBER_LABEL,
} from '@module/utils/nickname';
import { useRouter } from 'next/navigation';
import React from 'react';

interface DiaryAuthorRowProps {
  authorName: string | null;
  authorId: number | null;
  authorProfileImage: string | null;
  relativeDateLabel: string;
}

export function DiaryAuthorRow({
  authorName,
  authorId,
  authorProfileImage,
  relativeDateLabel,
}: DiaryAuthorRowProps): React.ReactElement {
  const router = useRouter();
  const withdrawn = isWithdrawnMember(authorName);
  const canOpen = Boolean(authorId) && !withdrawn;
  const handleClick = (): void => {
    if (canOpen) {
      const path = `/member/${authorId}`;
      if (!requestNativePushRoute(path)) {
        router.push(path);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canOpen}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left',
        canOpen && 'cursor-pointer transition-colors hover:bg-gray-50'
      )}
    >
      <CircleAvatar
        imageUrl={withdrawn ? undefined : (authorProfileImage ?? undefined)}
        size="md"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Text size="body2" weight="bold" className="truncate text-gray-900">
          {withdrawn ? WITHDRAWN_MEMBER_LABEL : (authorName ?? '익명')}
        </Text>
        <Text size="caption2" weight="regular" className="text-gray-500">
          {relativeDateLabel}
        </Text>
      </div>
    </button>
  );
}
