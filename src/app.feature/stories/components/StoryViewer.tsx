'use client';

import { CircleAvatar, Icon, Text } from '@1d1s/design-system';
import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { STORY_DURATION_MS } from '../consts/queryKeys';
import { useViewStory } from '../hooks/useStoryMutations';
import { StoryGroup } from '../type/story';
import { formatStoryDate } from '../utils/storyHelpers';

interface StoryViewerProps {
  groups: StoryGroup[];
  startIndex: number;
  onClose(): void;
  mode: 'dialog' | 'fullscreen';
}

interface StoryContentProps {
  group: StoryGroup;
  story: StoryGroup['stories'][number];
  nickname: string;
  profileUrl: string | undefined;
  thumbnailUrl: string | undefined;
  diaryIndex: number;
  totalForGroup: number;
  progress: number;
  paused: boolean;
  isDialog: boolean;
  onClose(): void;
  onOpenDiary(): void;
}

function StoryContent({
  group,
  story,
  nickname,
  profileUrl,
  thumbnailUrl,
  diaryIndex,
  totalForGroup,
  progress,
  paused,
  isDialog,
  onClose,
  onOpenDiary,
}: StoryContentProps): React.ReactElement {
  return (
    <div className="absolute inset-0 flex flex-col text-white">
      <div className="absolute inset-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={story.diaryTitle}
            fill
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div
            className={cn(
              'h-full w-full',
              'from-main-200 via-main-300 to-main-400 bg-gradient-to-br'
            )}
          />
        )}
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-b from-black/55 via-transparent to-black/85'
          )}
        />
      </div>

      <div className="relative flex flex-col gap-2.5 px-3.5 pt-3 pb-2.5">
        <div className="flex gap-1">
          {Array.from({ length: totalForGroup }).map((_, index) => {
            const fill =
              index < diaryIndex
                ? 1
                : index === diaryIndex
                  ? progress
                  : 0;
            return (
              <div
                key={index}
                className={cn(
                  'h-[3px] flex-1 overflow-hidden rounded-sm',
                  'bg-white/30'
                )}
              >
                <div
                  className="h-full bg-white"
                  style={{
                    width: `${fill * 100}%`,
                    transition:
                      index === diaryIndex && !paused
                        ? 'none'
                        : 'width 0.1s linear',
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex-shrink-0">
            <CircleAvatar
              size={32}
              imageUrl={profileUrl}
              tone="cream"
              alt={nickname}
            />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <Text
              size="caption1"
              weight="bold"
              className="block truncate text-white"
            >
              {nickname}
            </Text>
            <Text
              size="caption1"
              weight="medium"
              className="mt-0.5 block text-white/75"
            >
              {formatStoryDate(story.createdAt)}
            </Text>
          </div>
          {paused ? (
            <span
              className={cn(
                'rounded-full bg-white/20 px-2 py-1 text-[10px]',
                'font-bold text-white'
              )}
            >
              일시정지
            </span>
          ) : null}
          {!isDialog ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'rounded-full border-0 bg-black/30 text-white'
              )}
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative flex-1" />

      <div className="relative px-4 pt-3.5 pb-5">
        {group.stories.length > 1 ? (
          <Text
            size="caption1"
            weight="medium"
            className="mb-1.5 block text-white/70"
          >
            {diaryIndex + 1} / {totalForGroup}
          </Text>
        ) : null}
        <Text
          size="body1"
          weight="bold"
          className="mb-3 block text-white"
        >
          {story.diaryTitle}
        </Text>

        <button
          type="button"
          onClick={onOpenDiary}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full',
            'border border-white/40 bg-white/10 px-3.5 py-2',
            'text-xs font-semibold text-white backdrop-blur',
            'transition-colors hover:bg-white/20'
          )}
        >
          일지 보기
          <Icon name="ChevronRight" size={12} />
        </button>
      </div>
    </div>
  );
}

export default function StoryViewer({
  groups,
  startIndex,
  onClose,
  mode,
}: StoryViewerProps): React.ReactElement | null {
  const router = useRouter();
  const viewStoryMutation = useViewStory();
  const reportedRef = useRef<Set<number>>(new Set());

  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [diaryIndex, setDiaryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const group = groups[groupIndex];
  const story = group?.stories[diaryIndex];
  const isDialog = mode === 'dialog';

  // 시청 처리: 같은 diary 는 한 번만 호출.
  useEffect(() => {
    if (!story) {
      return;
    }
    if (reportedRef.current.has(story.diaryId)) {
      return;
    }
    reportedRef.current.add(story.diaryId);
    if (story.hasUnreadJournal) {
      viewStoryMutation.mutate(story.diaryId);
    }
  }, [story, viewStoryMutation]);

  // 스토리 전환 시 progress 초기화
  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    startRef.current = null;
  }, [groupIndex, diaryIndex]);

  const advanceToNext = useCallback(() => {
    if (!group) {
      onClose();
      return;
    }
    if (diaryIndex < group.stories.length - 1) {
      setDiaryIndex(diaryIndex + 1);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setDiaryIndex(0);
      return;
    }
    onClose();
  }, [diaryIndex, group, groupIndex, groups.length, onClose]);

  const advanceToPrev = useCallback(() => {
    if (diaryIndex > 0) {
      setDiaryIndex(diaryIndex - 1);
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex(groupIndex - 1);
      setDiaryIndex(Math.max(0, prevGroup.stories.length - 1));
      return;
    }
    setProgress(0);
    elapsedRef.current = 0;
    startRef.current = null;
  }, [diaryIndex, groupIndex, groups]);

  // requestAnimationFrame 으로 progress 진행. 일시정지 시 elapsed 누적값 유지.
  useEffect(() => {
    if (!story) {
      return;
    }
    let active = true;

    const tick = (now: number): void => {
      if (!active) {
        return;
      }
      if (paused) {
        startRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startRef.current == null) {
        startRef.current = now;
      }
      const dt = now - startRef.current;
      const totalElapsed = elapsedRef.current + dt;
      const next = Math.min(1, totalElapsed / STORY_DURATION_MS);
      setProgress(next);

      if (next >= 1) {
        elapsedRef.current = 0;
        startRef.current = null;
        advanceToNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (startRef.current != null && !paused) {
        elapsedRef.current =
          elapsedRef.current + (performance.now() - startRef.current);
      }
      startRef.current = null;
    };
    // advanceToNext 는 deps 변경 시 다시 등록되므로 의도적으로 제외.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, diaryIndex, paused]);

  // 키보드: ←/→ 이동, Space 일시정지, Esc 닫기
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        advanceToPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        advanceToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        setPaused((prev) => !prev);
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
  const nickname = group.nickname?.trim() || `친구 ${group.userId}`;

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
        'fixed inset-0 z-[1000] flex items-center justify-center',
        isDialog
          ? 'bg-black/70 backdrop-blur-md'
          : 'bg-[#0c0a08]'
      )}
    >
      {isDialog ? (
        <>
          <button
            type="button"
            onClick={advanceToPrev}
            aria-label="이전 스토리"
            className={cn(
              'absolute top-1/2 left-[calc(50%-260px)] -translate-y-1/2',
              'flex h-11 w-11 items-center justify-center rounded-full',
              'border-0 bg-white/15 text-white backdrop-blur'
            )}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={advanceToNext}
            aria-label="다음 스토리"
            className={cn(
              'absolute top-1/2 right-[calc(50%-260px)] -translate-y-1/2',
              'flex h-11 w-11 items-center justify-center rounded-full',
              'border-0 bg-white/15 text-white backdrop-blur'
            )}
          >
            ›
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={cn(
              'absolute top-6 right-6 flex h-10 w-10 items-center',
              'justify-center rounded-full border-0 bg-white/15 text-white'
            )}
          >
            ✕
          </button>
        </>
      ) : null}

      <div
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className={cn(
          'relative overflow-hidden bg-[#1a1714] shadow-2xl',
          isDialog
            ? 'h-[min(760px,92vh)] w-[min(420px,92vw)] rounded-2xl'
            : 'h-full w-full rounded-none'
        )}
      >
        <StoryContent
          group={group}
          story={story}
          nickname={nickname}
          profileUrl={profileUrl}
          thumbnailUrl={thumbnailUrl}
          diaryIndex={diaryIndex}
          totalForGroup={group.stories.length}
          progress={progress}
          paused={paused}
          isDialog={isDialog}
          onClose={onClose}
          onOpenDiary={handleOpenDiary}
        />

        <button
          type="button"
          aria-label="이전 스토리"
          onClick={(event) => {
            event.stopPropagation();
            advanceToPrev();
          }}
          className={cn(
            'absolute left-0 z-[2] w-[30%] border-0 bg-transparent',
            'top-[60px] bottom-[120px] cursor-pointer'
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
            'absolute right-0 z-[2] w-[30%] border-0 bg-transparent',
            'top-[60px] bottom-[120px] cursor-pointer'
          )}
        />
      </div>
    </div>
  );
}

