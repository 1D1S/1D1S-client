'use client';

import {
  CircleAvatar,
  Icon,
  ImagePlaceholder,
  Text,
} from '@1d1s/design-system';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import { StoryGroup } from '../type/story';
import { formatStoryDate, isGroupAllSeen } from '../utils/storyHelpers';

interface StoryRingProps {
  groups: StoryGroup[];
  onSelect(index: number): void;
  compact?: boolean;
  myProfileImage?: string | null;
  onAddStory?(): void;
}

export default function StoryRing({
  groups,
  onSelect,
  compact = false,
  myProfileImage,
  onAddStory,
}: StoryRingProps): React.ReactElement {
  const showMySlot = typeof onAddStory === 'function';
  const cardWidthClass = compact ? 'w-[120px]' : 'w-[140px]';
  const myImageUrl = resolveDiaryImageUrl(myProfileImage ?? null) ?? undefined;

  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        compact ? 'gap-2.5 px-4 py-3' : 'gap-3 px-5 py-3.5'
      )}
    >
      {showMySlot ? (
        <button
          type="button"
          onClick={onAddStory}
          className={cn(
            'flex flex-shrink-0 cursor-pointer flex-col gap-2 p-0',
            'border-0 bg-transparent text-left',
            'transition-transform hover:-translate-y-0.5',
            cardWidthClass
          )}
          aria-label="내 일지 추가"
        >
          <div
            className={cn(
              'rounded-3 relative flex aspect-4/5 w-full items-center',
              'justify-center overflow-hidden border-2 border-dashed',
              'border-gray-300 bg-gray-50'
            )}
          >
            <CircleAvatar
              size={56}
              imageUrl={myImageUrl}
              tone="peach"
              alt="내 일지"
            />
            <span
              className={cn(
                'absolute right-2 bottom-2 flex h-7 w-7 items-center',
                'justify-center rounded-full border-2 border-white',
                'bg-main-500 text-white shadow-sm'
              )}
              aria-hidden
            >
              <Icon name="Plus" size={14} />
            </span>
          </div>
          <div className="flex flex-col gap-0.5 px-0.5">
            <Text
              size="caption2"
              weight="bold"
              className="truncate text-gray-900"
            >
              내 일지
            </Text>
            <Text
              size="caption3"
              weight="medium"
              className="text-gray-500"
            >
              새 일지 작성하기
            </Text>
          </div>
        </button>
      ) : null}
      {groups.map((group, index) => {
        const seen = isGroupAllSeen(group);
        const [preview] = group.stories;
        const thumbnailUrl =
          resolveDiaryImageUrl(preview?.diaryThumbnail ?? null) ?? undefined;
        const profileUrl =
          resolveDiaryImageUrl(group.profileImage) ?? undefined;
        const name = group.userName?.trim() || `친구 ${group.userId}`;
        const title = preview?.diaryTitle ?? '';
        const time = preview ? formatStoryDate(preview.createdAt) : '';

        return (
          <button
            key={group.userId}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'flex flex-shrink-0 cursor-pointer flex-col gap-2 p-0',
              'border-0 bg-transparent text-left',
              'transition-transform hover:-translate-y-0.5',
              cardWidthClass
            )}
            aria-label={`${name} 스토리 열기`}
          >
            <div
              className={cn(
                'rounded-3 relative aspect-4/5 w-full overflow-hidden',
                'border-2 bg-gray-100',
                seen ? 'border-gray-200' : 'border-[#ff5722]'
              )}
            >
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 140px, 120px"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder
                  className="h-full w-full"
                  logoSize="sm"
                />
              )}
              <div
                className={cn(
                  'absolute inset-x-0 bottom-0 z-10 flex items-center',
                  'gap-1.5 bg-linear-to-t from-black/70 via-black/30',
                  'to-transparent px-2 py-2'
                )}
              >
                <CircleAvatar
                  size={22}
                  imageUrl={profileUrl}
                  tone="cream"
                  alt={name}
                />
                <Text
                  size="caption2"
                  weight="bold"
                  className="truncate text-white"
                >
                  {name}
                </Text>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 px-0.5">
              <Text
                size="caption2"
                weight="bold"
                className={cn(
                  'truncate',
                  seen ? 'text-gray-500' : 'text-gray-900'
                )}
              >
                {title}
              </Text>
              <Text
                size="caption3"
                weight="medium"
                className="text-gray-500"
              >
                {time}
              </Text>
            </div>
          </button>
        );
      })}
    </div>
  );
}
