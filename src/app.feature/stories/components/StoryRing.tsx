'use client';

import { CircleAvatar, Text } from '@1d1s/design-system';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import React from 'react';

import { StoryGroup } from '../type/story';
import { isGroupAllSeen } from '../utils/storyHelpers';

interface StoryRingProps {
  groups: StoryGroup[];
  onSelect(index: number): void;
  compact?: boolean;
}

export default function StoryRing({
  groups,
  onSelect,
  compact = false,
}: StoryRingProps): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        compact ? 'gap-2.5 px-4 py-3' : 'gap-3.5 px-5 py-3.5'
      )}
    >
      {groups.map((group, index) => {
        const seen = isGroupAllSeen(group);
        const imageUrl = resolveDiaryImageUrl(group.profileImage) ?? undefined;
        const label = group.nickname?.trim() || `친구 ${group.userId}`;

        return (
          <button
            key={group.userId}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'flex flex-shrink-0 cursor-pointer flex-col items-center',
              'gap-1.5 border-0 bg-transparent p-0',
              'transition-transform hover:scale-105'
            )}
            aria-label={`${label} 스토리 열기`}
          >
            <span
              className={cn(
                'flex items-center justify-center rounded-full p-[2.5px]',
                seen
                  ? 'bg-gray-300'
                  : 'bg-gradient-to-br from-[#ff8a65] via-[#ff5722] to-[#ff7043]'
              )}
            >
              <span className="block rounded-full border-[2.5px] border-white">
                <CircleAvatar
                  size={compact ? 60 : 68}
                  imageUrl={imageUrl}
                  tone="peach"
                  alt={label}
                />
              </span>
            </span>
            <Text
              size="caption1"
              weight="medium"
              className={cn(
                'max-w-[76px] truncate',
                seen ? 'text-gray-500' : 'text-gray-800'
              )}
            >
              {label}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
