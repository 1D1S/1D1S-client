'use client';

import { Card, Icon, Stripe, Text } from '@1d1s/design-system';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import { StoryGroup } from '../type/story';
import {
  formatStoryDate,
  isGroupAllSeen,
  pickStoryStripeTone,
} from '../utils/storyHelpers';

interface StoryRingProps {
  groups: StoryGroup[];
  onSelect(index: number): void;
  compact?: boolean;
  myProfileImage?: string | null;
  onAddStory?(): void;
}

// next/image 는 절대 URL 또는 / 시작 상대 경로만 허용한다.
function isValidNextImageSrc(src: string | undefined): src is string {
  if (!src) {
    return false;
  }
  if (src.startsWith('/')) {
    return true;
  }
  return /^(https?:|data:|blob:)/i.test(src);
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
  const hasMyImage = isValidNextImageSrc(myImageUrl);

  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        compact ? 'gap-2.5 px-4 py-3' : 'gap-3 px-5 py-3.5 lg:px-8'
      )}
    >
      {showMySlot ? (
        <Card
          interactive
          radius="md"
          role="button"
          tabIndex={0}
          onClick={onAddStory}
          aria-label="내 일지 추가"
          className={cn(
            'flex-shrink-0 transition-all duration-300 ease-out',
            'hover:shadow-warm',
            cardWidthClass
          )}
        >
          <Card.Thumb className="bg-main-100 aspect-[4/5]">
            <Stripe tone="peach" />
            <Card.Overlay position="top-right">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  'bg-main-500 border-2 border-white text-white shadow-sm'
                )}
                aria-hidden
              >
                <Icon name="Plus" size={14} />
              </span>
            </Card.Overlay>
          </Card.Thumb>
          <Card.Body className="gap-1.5 p-3">
            <Text
              size="caption2"
              weight="extrabold"
              className={cn(
                'truncate leading-snug tracking-tight text-gray-900'
              )}
            >
              내 일지
            </Text>
            <Card.Meta>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span
                  className={cn(
                    'relative h-5 w-5 shrink-0 overflow-hidden rounded-full',
                    'bg-gray-100'
                  )}
                  aria-hidden
                >
                  {hasMyImage ? (
                    <Image
                      src={myImageUrl as string}
                      alt=""
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'truncate text-[11px] font-medium text-gray-500'
                  )}
                >
                  새 일지 작성하기
                </span>
              </span>
            </Card.Meta>
          </Card.Body>
        </Card>
      ) : null}
      {groups.map((group, index) => {
        const seen = isGroupAllSeen(group);
        const [preview] = group.stories;
        const thumbnailUrl =
          resolveDiaryImageUrl(preview?.diaryThumbnail ?? null) ?? undefined;
        const profileUrl =
          resolveDiaryImageUrl(group.profileImage) ?? undefined;
        const hasThumbnail = isValidNextImageSrc(thumbnailUrl);
        const hasProfile = isValidNextImageSrc(profileUrl);
        const name = group.userName?.trim() || `친구 ${group.userId}`;
        const title = preview?.diaryTitle ?? '';
        const time = preview ? formatStoryDate(preview.createdAt) : '';
        const tone = pickStoryStripeTone(group.userId);

        return (
          <Card
            key={group.userId}
            interactive
            radius="md"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(index)}
            aria-label={`${name} 스토리 열기`}
            className={cn(
              'flex-shrink-0 transition-all duration-300 ease-out',
              'hover:shadow-warm',
              cardWidthClass
            )}
          >
            <Card.Thumb className="bg-main-100 aspect-[4/5]">
              {hasThumbnail ? (
                <Image
                  src={thumbnailUrl as string}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 140px, 120px"
                  className="object-cover"
                />
              ) : (
                <Stripe tone={tone} />
              )}
              {!seen ? (
                <Card.Overlay position="top-left">
                  <span
                    className={cn(
                      'bg-brand inline-flex items-center gap-1 rounded-full',
                      'px-2 py-0.5 text-[10px] font-extrabold text-white',
                      'shadow-sm'
                    )}
                  >
                    NEW
                  </span>
                </Card.Overlay>
              ) : null}
            </Card.Thumb>
            <Card.Body className="gap-1.5 p-3">
              <Text
                size="caption2"
                weight="extrabold"
                className={cn(
                  'truncate leading-snug tracking-tight',
                  seen ? 'text-gray-500' : 'text-gray-900'
                )}
              >
                {title || name}
              </Text>
              <Card.Meta>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn(
                      'relative h-5 w-5 shrink-0 overflow-hidden',
                      'rounded-full bg-gray-100'
                    )}
                    aria-hidden
                  >
                    {hasProfile ? (
                      <Image
                        src={profileUrl as string}
                        alt=""
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      'truncate text-[11px] font-medium text-gray-500'
                    )}
                  >
                    {name}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 text-[11px] font-medium text-gray-400'
                  )}
                >
                  {time}
                </span>
              </Card.Meta>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}
