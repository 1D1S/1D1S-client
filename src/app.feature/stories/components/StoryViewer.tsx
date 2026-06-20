'use client';

import { CircleAvatar, Icon, Stripe, Text } from '@1d1s/design-system';
import FadeInImage from '@component/FadeInImage';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useViewStory } from '../hooks/useStoryMutations';
import { StoryGroup } from '../type/story';
import { formatStoryDate, pickStoryStripeTone } from '../utils/storyHelpers';

// 스토리 자동 전환 간격(ms). 진행 바 애니메이션 길이와 동일하게 맞춘다.
const STORY_DURATION_MS = 5000;

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

  // 뷰어가 열려 있는 동안 부모의 재정렬(시청 처리 → 캐시 갱신)이 그룹 배열을
  // 흔들어 인덱스가 어긋나는 것을 막기 위해, 열린 시점의 스냅샷을 고정한다.
  const [frozenGroups] = useState(groups);
  const lastGroupIndex = Math.max(0, frozenGroups.length - 1);
  const [groupIndex, setGroupIndex] = useState(() =>
    Math.min(Math.max(startIndex, 0), lastGroupIndex)
  );
  const [diaryIndex, setDiaryIndex] = useState(0);

  // 자동 전환 타이머와 수동 넘김이 경합할 때, stale 클로저가 인덱스를 두 번
  // 증가시켜 경계를 벗어나면 뷰어가 빈 화면으로 멈춘다(다시 열어도 안 열림).
  // 최신 위치를 ref 로 동기 추적해 항상 한 칸씩, 경계 안에서만 이동한다.
  const positionRef = useRef({ groupIndex, diaryIndex });
  useEffect(() => {
    positionRef.current = { groupIndex, diaryIndex };
  }, [groupIndex, diaryIndex]);

  const group = frozenGroups[groupIndex];
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
    const { groupIndex: gi, diaryIndex: di } = positionRef.current;
    const currentGroup = frozenGroups[gi];
    if (!currentGroup) {
      onClose();
      return;
    }
    if (di < currentGroup.stories.length - 1) {
      positionRef.current = { groupIndex: gi, diaryIndex: di + 1 };
      setDiaryIndex(di + 1);
      return;
    }
    if (gi < frozenGroups.length - 1) {
      positionRef.current = { groupIndex: gi + 1, diaryIndex: 0 };
      setGroupIndex(gi + 1);
      setDiaryIndex(0);
      return;
    }
    onClose();
  }, [frozenGroups, onClose]);

  const advanceToPrev = useCallback(() => {
    const { groupIndex: gi, diaryIndex: di } = positionRef.current;
    if (di > 0) {
      positionRef.current = { groupIndex: gi, diaryIndex: di - 1 };
      setDiaryIndex(di - 1);
      return;
    }
    if (gi > 0) {
      const prevGroup = frozenGroups[gi - 1];
      const prevDiary = Math.max(0, prevGroup.stories.length - 1);
      positionRef.current = { groupIndex: gi - 1, diaryIndex: prevDiary };
      setGroupIndex(gi - 1);
      setDiaryIndex(prevDiary);
    }
  }, [frozenGroups]);

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

  // 스토리 자동 전환: 일정 시간이 지나면 다음 스토리로 넘어간다.
  useEffect(() => {
    if (!story) {
      return;
    }
    const timer = window.setTimeout(advanceToNext, STORY_DURATION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [story, advanceToNext]);

  // body scroll lock
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // 위치가 비면 빈 화면으로 마운트된 채 남지 않도록 부모에 닫힘을 알린다.
  // 이게 없으면 openIndex 가 리셋되지 않아 다른 스토리를 눌러도 안 열린다.
  useEffect(() => {
    if (!group || !story) {
      onClose();
    }
  }, [group, story, onClose]);

  if (!group || !story) {
    return null;
  }

  const thumbnailUrl = resolveDiaryImageUrl(story.diaryThumbnail) ?? undefined;
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
        'animate-story-overlay-in fixed inset-0 z-1000 flex',
        'items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm'
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
          'animate-story-card-in rounded-4 relative w-full max-w-[420px]',
          'overflow-hidden bg-white shadow-2xl'
        )}
      >
        <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <FadeInImage
              key={`${groupIndex}-${diaryIndex}`}
              src={thumbnailUrl}
              alt={story.diaryTitle}
              fill
              sizes="(min-width: 1024px) 420px, 92vw"
              className="object-cover"
              priority
            />
          ) : (
            <Stripe tone={pickStoryStripeTone(group.userId)} />
          )}

          <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
            {group.stories.map((_, index) => {
              const isPast = index < diaryIndex;
              const isCurrent = index === diaryIndex;
              return (
                <div
                  key={index}
                  className={cn(
                    'h-1 flex-1 overflow-hidden rounded-full',
                    'bg-white/40'
                  )}
                >
                  {isPast ? (
                    <div className="h-full w-full rounded-full bg-white" />
                  ) : null}
                  {isCurrent ? (
                    <div
                      key={`${groupIndex}-${diaryIndex}`}
                      className={cn(
                        'story-progress-fill h-full w-full rounded-full',
                        'bg-white'
                      )}
                      style={{ animationDuration: `${STORY_DURATION_MS}ms` }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

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
                <Text size="caption3" weight="medium" className="text-gray-500">
                  {formatStoryDate(story.createdAt)}
                  {hasMultiple
                    ? ` · ${diaryIndex + 1}/${group.stories.length}`
                    : ''}
                </Text>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenDiary}
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-1',
                'bg-main-700 hover:bg-main-800 rounded-full px-3.5 py-2',
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
