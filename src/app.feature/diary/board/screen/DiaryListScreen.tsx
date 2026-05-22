'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { normalizeApiError } from '@module/api/error';
import { useInViewObserver } from '@module/hooks/useInViewObserver';
import { cn } from '@module/utils/cn';
import { getDateTimestamp } from '@module/utils/date';
import { motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import {
  useLikeDiary,
  useUnlikeDiary,
} from '../../detail/hooks/useDiaryMutations';
import { resolveDiaryImageUrl } from '../../shared/utils/diaryImageUrl';
import { mapFeelingToEmotion } from '../../shared/utils/feeling';
import { useDiaryList } from '../hooks/useDiaryQueries';
import { type DiaryItem } from '../type/diary';

type SortMode = 'latest' | 'likes';
type DiaryItemWithAliases = DiaryItem & {
  author?: DiaryItem['authorInfoDto'] | null;
  diaryInfo?: DiaryItem['diaryInfoDto'] | null;
};

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
    const leftDiaryTime = getDateTimestamp(
      leftDiaryInfo?.createdAt || leftDiaryInfo?.challengedDate || ''
    );
    const rightDiaryTime = getDateTimestamp(
      rightDiaryInfo?.createdAt || rightDiaryInfo?.challengedDate || ''
    );

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

export default function DiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
  const isLoggedIn = useIsLoggedIn();
  const [sortMode] = useState<SortMode>('latest');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogDescription, setLoginDialogDescription] = useState(
    '로그인 후 이용할 수 있습니다.'
  );

  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoginDialogDescription('일지 상세는 로그인 후 이용할 수 있습니다.');
    }
  }

  useEffect(() => {
    if (!isLoginRequired) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete('loginRequired');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [isLoginRequired, pathname, router, searchParams]);

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
    if (!isLoggedIn) {
      setLoginDialogDescription('일지 상세는 로그인 후 이용할 수 있습니다.');
      setShowLoginDialog(true);
      return;
    }
    router.push(`/diary/${id}`);
  };

  const handleLikeToggle = (diary: DiaryItem): void => {
    if (!isLoggedIn) {
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
    <div className="min-h-screen w-full">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        description={loginDialogDescription}
      />

      {/* 모바일 sticky 헤더 — 일지 */}
      <div
        className={cn(
          'sticky top-0 z-20 flex items-center justify-between',
          'gap-3 border-b border-gray-100',
          'bg-white/95 px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
          'backdrop-blur lg:hidden'
        )}
      >
        <Text
          as="h1"
          size="heading1"
          weight="extrabold"
          className="tracking-[-0.5px] text-gray-900"
        >
          일지
        </Text>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => router.push('/diary/create')}
            aria-label="일지 쓰기"
            className={cn(
              'rounded-2 bg-brand shrink-0 px-3 py-1.5',
              'text-[12px] font-bold text-white transition',
              'hover:brightness-105'
            )}
          >
            + 일지 쓰기
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-4 border-b border-gray-100 pb-5',
            'lg:flex lg:flex-row lg:items-end lg:justify-between'
          )}
        >
          <div className="flex flex-col gap-1.5">
            <Text
              size="pageTitle"
              weight="extrabold"
              className="tracking-tight text-gray-900"
            >
              일지 보드
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              다른 챌린저의 일지를 보며 동기부여를 얻어보세요.
            </Text>
          </div>
        </header>

        {isLoading ? (
          <DiaryCardSkeletonGrid
            count={12}
            className="mt-6"
          />
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
          <div
            className={cn(
              'data-fade-in mt-6 grid gap-4',
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {sortedDiaries.map((item) => {
              const diaryInfo = getDiaryInfo(item);
              const authorInfo = getDiaryAuthorInfo(item);

              return (
                <motion.div
                  key={item.id}
                  layout
                  className="min-w-0 self-start"
                  transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                >
                  <DiaryCard
                    imageUrl={item.imgUrl?.[0]}
                    profileImageUrl={
                      resolveDiaryImageUrl(authorInfo?.profileImage) ??
                      undefined
                    }
                    percent={getDiaryAchievementRate(item)}
                    isLiked={item.likeInfo.likedByMe}
                    likes={item.likeInfo.likeCnt}
                    title={item.title}
                    user={authorInfo?.nickname ?? '익명'}
                    challengeLabel={
                      item.challenge?.title ||
                      getCategoryLabel(item.challenge?.category) ||
                      '챌린지'
                    }
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
        ) : null}

        {!isLoading && !isError && !hasLoadedDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 등록된 일지가 없습니다.
            </Text>
          </div>
        ) : null}

        {isFetchingNextPage ? (
          <DiaryCardSkeletonGrid count={4} className="mt-4" />
        ) : null}

        <div
          ref={ref}
          className="mt-6 flex h-10 w-full items-center justify-center"
        >
          {isFetchingNextPage ? null : isError && hasLoadedDiaries ? (
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
      </div>
    </div>
  );
}
