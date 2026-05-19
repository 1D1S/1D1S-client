'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
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
  const handleClick = (): void => {
    if (authorId) {
      router.push(`/member/${authorId}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!authorId}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl py-1 text-left',
        authorId && 'cursor-pointer transition-colors hover:bg-gray-50'
      )}
    >
      <CircleAvatar imageUrl={authorProfileImage ?? undefined} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Text size="body2" weight="bold" className="truncate text-gray-900">
          {authorName ?? '익명'}
        </Text>
        <Text size="caption2" weight="regular" className="text-gray-500">
          {relativeDateLabel}
        </Text>
      </div>
    </button>
  );
}
