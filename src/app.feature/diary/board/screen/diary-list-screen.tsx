'use client';

import { DiaryCard, Text } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { normalizeApiError } from '@module/api/error';
import { authStorage } from '@module/utils/auth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  useLikeDiary,
  useUnlikeDiary,
} from '../../detail/hooks/use-diary-mutations';
import { useDiaryList } from '../hooks/use-diary-queries';
import { type DiaryItem, Feeling } from '../type/diary';

type SortMode = 'latest' | 'likes';
type DiaryEmotion = 'happy' | 'soso' | 'sad';
type DiaryItemWithAliases = DiaryItem & {
  author?: DiaryItem['authorInfoDto'] | null;
  diaryInfo?: DiaryItem['diaryInfoDto'] | null;
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ko', {
  numeric: 'auto',
});

function mapFeelingToEmotion(feeling: Feeling): DiaryEmotion {
  switch (feeling) {
    case 'HAPPY':
      return 'happy';
    case 'SAD':
      return 'sad';
    case 'NORMAL':
    case 'NONE':
    default:
      return 'soso';
  }
}

function toRelativeDateLabel(createdAt: string): string {
  if (!createdAt) {
    return '방금 전';
  }

  const targetDate = new Date(createdAt);
  if (Number.isNaN(targetDate.getTime())) {
    return '방금 전';
  }

  const diffMinutes = Math.round((targetDate.getTime() - Date.now()) / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

function sortDiaries(items: DiaryItem[], sortMode: SortMode): DiaryItem[] {
  const sorted = [...items];

  if (sortMode === 'likes') {
    sorted.sort(
      (leftDiary, rightDiary) =>
        rightDiary.likeInfo.likeCnt - leftDiary.likeInfo.likeCnt
    );
    return sorted;
  }

  sorted.sort((leftDiary, rightDiary) => {
    const leftDiaryWithAliases = leftDiary as DiaryItemWithAliases;
    const rightDiaryWithAliases = rightDiary as DiaryItemWithAliases;
    const leftDiaryInfo =
      leftDiaryWithAliases.diaryInfoDto ??
      leftDiaryWithAliases.diaryInfo ??
      null;
    const rightDiaryInfo =
      rightDiaryWithAliases.diaryInfoDto ??
      rightDiaryWithAliases.diaryInfo ??
      null;
    const leftDiaryTime = new Date(
      leftDiaryInfo?.createdAt || leftDiaryInfo?.challengedDate || ''
    ).getTime();
    const rightDiaryTime = new Date(
      rightDiaryInfo?.createdAt || rightDiaryInfo?.challengedDate || ''
    ).getTime();

    return rightDiaryTime - leftDiaryTime;
  });

  return sorted;
}

function getDiaryAuthorInfo(diary: DiaryItem): DiaryItem['authorInfoDto'] {
  const diaryWithAliases = diary as DiaryItemWithAliases;
  return diaryWithAliases.authorInfoDto ?? diaryWithAliases.author ?? null;
}

function getDiaryInfo(diary: DiaryItem): DiaryItem['diaryInfoDto'] {
  const diaryWithAliases = diary as DiaryItemWithAliases;
  return diaryWithAliases.diaryInfoDto ?? diaryWithAliases.diaryInfo ?? null;
}

function getDiaryAchievementRate(diary: DiaryItem): number {
  const diaryInfo = getDiaryInfo(diary);
  const rawAchievementRate =
    diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;

  return Math.min(100, Math.max(0, rawAchievementRate));
}

function useInViewObserver(): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [observedInView, setObservedInView] = useState(false);
  const isIntersectionObserverUnsupported =
    typeof window !== 'undefined' &&
    typeof IntersectionObserver === 'undefined';

  useEffect(() => {
    const target = ref.current;

    if (!target || typeof window === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setObservedInView(entry.isIntersecting);
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const inView = isIntersectionObserverUnsupported ? true : observedInView;

  return { ref, inView };
}

export default function DiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const [sortMode] = useState<SortMode>('latest');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] = useState(
    '로그인 후 이용할 수 있습니다.'
  );
  const likeDiary = useLikeDiary();
  const unlikeDiary = useUnlikeDiary();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiaryList({ size: 12 });
  const { ref, inView } = useInViewObserver();
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;
  const diaries = useMemo(() => {
    const flattenedDiaries =
      data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const diaryMap = new Map<number, DiaryItem>();

    flattenedDiaries.forEach((diary) => {
      diaryMap.set(diary.id, diary);
    });

    return Array.from(diaryMap.values());
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sortedDiaries = useMemo(
    () => sortDiaries(diaries, sortMode),
    [diaries, sortMode]
  );
  const hasLoadedDiaries = sortedDiaries.length > 0;

  const handleCardClick = (id: number): void => {
    if (!authStorage.hasTokens()) {
      setLoginDialogDescription('일지 상세는 로그인 후 이용할 수 있습니다.');
      setShowLoginDialog(true);
      return;
    }
    router.push(`/diary/${id}`);
  };

  const handleLikeToggle = (diary: DiaryItem): void => {
    if (!authStorage.hasTokens()) {
      setLoginDialogDescription('좋아요 기능은 로그인 후 이용할 수 있습니다.');
      setShowLoginDialog(true);
      return;
    }

    if (isLikePending) {
      return;
    }

    if (diary.likeInfo.likedByMe) {
      unlikeDiary.mutate(diary.id);
      return;
    }

    likeDiary.mutate(diary.id);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        description={loginDialogDescription}
      />
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-2">
            <Text size="display1" weight="bold" className="text-gray-900">
              일지
            </Text>
            <Text size="body1" weight="regular" className="text-gray-600">
              다른 챌린저의 일지를 보며 동기부여를 얻어보세요
            </Text>
          </div>

          {/* <button
            type="button"
            className="mt-1 flex items-center gap-1 rounded-full px-3 py-2 text-gray-600 transition hover:bg-gray-200"
            onClick={() =>
              setSortMode((prev) => (prev === 'latest' ? 'likes' : 'latest'))
            }
          >
            <ArrowUpDown className="h-4 w-4" />
            <Text size="body2" weight="medium">
              {sortMode === 'latest' ? '최신순' : '좋아요순'}
            </Text>
          </button> */}
        </div>

        {isLoading ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              일지를 불러오는 중입니다.
            </Text>
          </div>
        ) : null}

        {isError && !hasLoadedDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-red-600">
              {error
                ? normalizeApiError(error).message
                : '일지를 불러오지 못했습니다.'}
            </Text>
          </div>
        ) : null}

        {!isLoading && hasLoadedDiaries ? (
          <div className="diary-grid-container mt-6">
            <div className="diary-card-grid grid grid-cols-2 gap-4">
              {sortedDiaries.map((item) => {
                const diaryInfo = getDiaryInfo(item);
                const authorInfo = getDiaryAuthorInfo(item);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                  >
                    <DiaryCard
                      imageUrl={item.imgUrl?.[0] ?? '/images/default-card.png'}
                      percent={getDiaryAchievementRate(item)}
                      isLiked={item.likeInfo.likedByMe}
                      likes={item.likeInfo.likeCnt}
                      title={item.title}
                      user={authorInfo?.nickname ?? '익명'}
                      userImage={
                        authorInfo?.profileImage ??
                        '/images/default-profile.png'
                      }
                      challengeLabel={
                        item.challenge?.title ??
                        item.challenge?.category ??
                        '챌린지'
                      }
                      onChallengeClick={() =>
                        router.push(
                          item.challenge
                            ? `/challenge/${item.challenge.challengeId}`
                            : '/challenge'
                        )
                      }
                      date={toRelativeDateLabel(diaryInfo?.createdAt ?? '')}
                      emotion={mapFeelingToEmotion(
                        diaryInfo?.feeling ?? 'NONE'
                      )}
                      onLikeToggle={() => handleLikeToggle(item)}
                      onClick={() => handleCardClick(item.id)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && !hasLoadedDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 등록된 일지가 없습니다.
            </Text>
          </div>
        ) : null}

        <div
          ref={ref}
          className="mt-4 flex h-10 w-full items-center justify-center"
        >
          {isFetchingNextPage ? (
            <Text size="body2" className="text-gray-400">
              데이터를 불러오는 중...
            </Text>
          ) : isError && hasLoadedDiaries ? (
            <Text size="body2" className="text-red-500">
              {error
                ? normalizeApiError(error).message
                : '추가 일지를 불러오지 못했습니다.'}
            </Text>
          ) : hasNextPage ? (
            <div />
          ) : hasLoadedDiaries ? (
            <Text size="body2" className="text-gray-400">
              마지막 일지입니다.
            </Text>
          ) : null}
        </div>
      </section>
    </div>
  );
}
