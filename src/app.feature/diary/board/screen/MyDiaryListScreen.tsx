'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { DiaryItem } from '@feature/diary/board/type/diary';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { normalizeApiError } from '@module/api/error';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { buildDiaryCardViewModels } from '../../../member/mypage/utils/mypageUtils';
import { useMyDiariesInfinite } from '../hooks/useDiaryQueries';

const MY_DIARY_PAGE_SIZE = 12;

export function MyDiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { data: sidebar } = useSidebar();
  const nickname = sidebar?.nickname ?? '나';
  const [showLoginDialog, setShowLoginDialog] = useState(false);
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
  } = useMyDiariesInfinite(MY_DIARY_PAGE_SIZE);
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const diaryItems = useMemo(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const diaryMap = new Map<number, DiaryItem>();
    flattened.forEach((diary) => {
      diaryMap.set(diary.id, diary);
    });
    return Array.from(diaryMap.values());
  }, [data]);

  const diaryCards = useMemo(
    () => buildDiaryCardViewModels(diaryItems, nickname),
    [diaryItems, nickname]
  );

  const hasDiaries = diaryCards.length > 0;
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  const handleLikeToggle = (id: number, isLiked: boolean): void => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    if (isLikePending) {
      return;
    }
    if (isLiked) {
      unlikeDiary.mutate(id);
    } else {
      likeDiary.mutate(id);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {/* 모바일 sticky 헤더 — ← + 내 일지 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3',
          'h-14-safe pt-safe-top',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          내 일지
        </Text>
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
              내 일지
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              내가 작성한 일지 전체 목록입니다.
            </Text>
          </div>
        </header>

        {showSkeleton ? (
          <DiaryCardSkeletonGrid count={MY_DIARY_PAGE_SIZE} className="mt-6" />
        ) : null}

        {isError && !hasDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-red-600">
              {error
                ? normalizeApiError(error).message
                : '일지를 불러오지 못했습니다.'}
            </Text>
          </div>
        ) : null}

        {!showSkeleton && hasDiaries ? (
          <div
            className={cn(
              'data-fade-in mt-6 grid gap-4',
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {diaryCards.map((diary) => (
              <DiaryCard
                key={diary.id}
                imageUrl={diary.imageUrl}
                profileImageUrl={diary.profileImageUrl}
                percent={diary.percent}
                isLiked={diary.isLiked}
                likes={diary.likes}
                title={diary.title}
                user={diary.user}
                challengeLabel={diary.challengeLabel}
                emotion={diary.emotion}
                onClick={() => router.push(`/diary/${diary.id}`)}
                onLikeToggle={() => handleLikeToggle(diary.id, diary.isLiked)}
              />
            ))}
          </div>
        ) : null}

        {!showSkeleton && !isError && !hasDiaries ? (
          <div className="mt-10 flex w-full justify-center py-10">
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 작성한 일지가 없습니다.
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
          {isFetchingNextPage ? null : isError && hasDiaries ? (
            <Text size="body2" className="text-red-500">
              {error
                ? normalizeApiError(error).message
                : '추가 일지를 불러오지 못했습니다.'}
            </Text>
          ) : hasNextPage ? (
            <div />
          ) : hasDiaries ? (
            <Text size="body2" className="text-gray-400">
              마지막 일지입니다.
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  );
}
