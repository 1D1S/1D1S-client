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
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useViewStory } from '../hooks/useStoryMutations';
import { StoryGroup } from '../type/story';
import { formatStoryDate } from '../utils/storyHelpers';

interface StoryViewerProps {
  groups: StoryGroup[];
  startIndex: number;
  onClose(): void;
}

export default function StoryViewer({
  groups,
  startIndex,
  onClose,
}: StoryViewerProps): React.ReactElement | null {
  const router = useRouter();
  const viewStoryMutation = useViewStory();
  const reportedRef = useRef<Set<number>>(new Set());

  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [diaryIndex, setDiaryIndex] = useState(0);

  const group = groups[groupIndex];
  const story = group?.stories[diaryIndex];

  const diaryId = story?.diaryId;
  const hasUnreadJournal = story?.hasUnreadJournal ?? false;
  const viewStoryMutate = viewStoryMutation.mutate;

  useEffect(() => {
    if (diaryId === undefined) {
      return;
    }
    if (reportedRef.current.has(diaryId)) {
      return;
    }
    reportedRef.current.add(diaryId);
    if (hasUnreadJournal) {
      viewStoryMutate(diaryId);
    }
  }, [diaryId, hasUnreadJournal, viewStoryMutate]);

  const advanceToNext = useCallback(() => {
    const currentGroup = groups[groupIndex];
    if (!currentGroup) {
      onClose();
      return;
    }
    if (diaryIndex < currentGroup.stories.length - 1) {
      setDiaryIndex((prev) => prev + 1);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setDiaryIndex(0);
      return;
    }
    onClose();
  }, [diaryIndex, groupIndex, groups, onClose]);

  const advanceToPrev = useCallback(() => {
    if (diaryIndex > 0) {
      setDiaryIndex((prev) => prev - 1);
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((prev) => prev - 1);
      setDiaryIndex(Math.max(0, prevGroup.stories.length - 1));
    }
  }, [diaryIndex, groupIndex, groups]);

  // 키보드: ←/→ 이동, Esc 닫기
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        advanceToPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        advanceToNext();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advanceToNext, advanceToPrev, onClose]);

  // body scroll lock
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!group || !story) {
    return null;
  }

  const thumbnailUrl =
    resolveDiaryImageUrl(story.diaryThumbnail) ?? undefined;
  const profileUrl = resolveDiaryImageUrl(group.profileImage) ?? undefined;
  const name = group.userName?.trim() || `친구 ${group.userId}`;
  const hasMultiple = group.stories.length > 1;

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleOpenDiary = (): void => {
    onClose();
    router.push(`/diary/${story.diaryId}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-1000 flex items-center justify-center',
        'bg-black/60 px-4 py-6 backdrop-blur-sm'
      )}
    >
      <button
        type="button"
        onClick={advanceToPrev}
        aria-label="이전 스토리"
        className={cn(
          'absolute top-1/2 left-2 z-10 hidden h-11 w-11 -translate-y-1/2',
          'cursor-pointer items-center justify-center rounded-full border-0',
          'bg-white/15 text-white backdrop-blur sm:left-6 sm:flex'
        )}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={advanceToNext}
        aria-label="다음 스토리"
        className={cn(
          'absolute top-1/2 right-2 z-10 hidden h-11 w-11 -translate-y-1/2',
          'cursor-pointer items-center justify-center rounded-full border-0',
          'bg-white/15 text-white backdrop-blur sm:right-6 sm:flex'
        )}
      >
        ›
      </button>

      <div
        className={cn(
          'rounded-4 relative w-full max-w-[420px] overflow-hidden bg-white',
          'shadow-2xl'
        )}
      >
        <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={story.diaryTitle}
              fill
              sizes="(min-width: 1024px) 420px, 92vw"
              className="object-cover"
              priority
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" logoSize="lg" />
          )}

          {hasMultiple ? (
            <div
              className={cn(
                'absolute inset-x-3 top-3 z-10 flex gap-1'
              )}
            >
              {group.stories.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    index === diaryIndex ? 'bg-white' : 'bg-white/40'
                  )}
                />
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={cn(
              'absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer',
              'items-center justify-center rounded-full border-0',
              'bg-black/40 text-white backdrop-blur-sm'
            )}
          >
            ✕
          </button>

          <button
            type="button"
            aria-label="이전 스토리"
            onClick={(event) => {
              event.stopPropagation();
              advanceToPrev();
            }}
            className={cn(
              'absolute top-12 bottom-0 left-0 z-2 w-1/3 cursor-pointer',
              'border-0 bg-transparent sm:hidden'
            )}
          />
          <button
            type="button"
            aria-label="다음 스토리"
            onClick={(event) => {
              event.stopPropagation();
              advanceToNext();
            }}
            className={cn(
              'absolute top-12 right-0 bottom-0 z-2 w-1/3 cursor-pointer',
              'border-0 bg-transparent sm:hidden'
            )}
          />
        </div>

        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <Text
            size="body1"
            weight="bold"
            className="leading-tight text-gray-900"
          >
            {story.diaryTitle}
          </Text>

          <div className="h-px w-full bg-gray-200" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <CircleAvatar
                size="sm"
                imageUrl={profileUrl}
                tone="cream"
                alt={name}
              />
              <div className="flex min-w-0 flex-col">
                <Text
                  size="caption1"
                  weight="bold"
                  className="truncate text-gray-900"
                >
                  {name}
                </Text>
                <Text
                  size="caption3"
                  weight="medium"
                  className="text-gray-500"
                >
                  {formatStoryDate(story.createdAt)}
                  {hasMultiple ? ` · ${diaryIndex + 1}/${group.stories.length}` : ''}
                </Text>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenDiary}
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-1',
                'bg-main-500 hover:bg-main-600 rounded-full px-3.5 py-2',
                'text-xs font-bold text-white transition-colors'
              )}
            >
              일지 보기
              <Icon name="ChevronRight" size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
