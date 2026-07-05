'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '@feature/diary/shared/utils/diaryImageUrl';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { normalizeApiError } from '@module/api/error';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useChallengeDiaryListInfinite } from '../hooks/useChallengeDiaryQueries';
import { ChallengeDiaryItem } from '../type/challengeDiary';

const CHALLENGE_DIARY_PAGE_SIZE = 12;

interface ChallengeDiaryListScreenProps {
  id: string;
}

interface ChallengeDiaryListItemProps {
  diary: ChallengeDiaryItem;
  onLikeToggle(diary: ChallengeDiaryItem): void;
}

// 매 렌더마다 `() => handleLikeToggle(diary)` 같은 인라인 람다를 만들지
// 않고, 안정적인 핸들러와 diary 만 props 로 받는다. React.memo 로 감싸
// 부모가 재렌더돼도 동일 diary 카드는 재렌더를 건너뛴다.
const ChallengeDiaryListItem = React.memo(
  ({
    diary,
    onLikeToggle,
  }: ChallengeDiaryListItemProps): React.ReactElement => {
    const handleLike = useCallback(() => {
      onLikeToggle(diary);
    }, [onLikeToggle, diary]);

    return (
      <DiaryCard
        imageUrl={resolveDiaryImageList(diary.imgUrl)?.[0]}
        profileImageUrl={
          resolveDiaryImageUrl(diary.author?.profileImage) ?? undefined
        }
        percent={Math.min(
          100,
          Math.max(0, diary.diaryInfo?.achievementRate ?? 0)
        )}
        isLiked={diary.likeInfo.likedByMe}
        likes={diary.likeInfo.likeCnt}
        title={diary.title}
        user={diary.author?.nickname ?? '익명'}
        challengeLabel={
          diary.challenge?.title ||
          getCategoryLabel(diary.challenge?.category) ||
          '챌린지'
        }
        emotion={mapFeelingToEmotion(diary.diaryInfo?.feeling ?? 'NONE')}
        href={`/diary/${diary.id}`}
        onLikeToggle={handleLike}
      />
    );
  }
);
ChallengeDiaryListItem.displayName = 'ChallengeDiaryListItem';

export function ChallengeDiaryListScreen({
  id,
}: ChallengeDiaryListScreenProps): React.ReactElement {
  const challengeId = Number(id);
  const handleBack = useSafeBack(`/challenge/${id}`);
  const isLoggedIn = useIsLoggedIn();
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
  } = useChallengeDiaryListInfinite(challengeId, CHALLENGE_DIARY_PAGE_SIZE);
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const diaryItems = useMemo(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const diaryMap = new Map<number, ChallengeDiaryItem>();
    flattened.forEach((diary) => {
      diaryMap.set(diary.id, diary);
    });
    return Array.from(diaryMap.values());
  }, [data]);

  const hasDiaries = diaryItems.length > 0;
  const isLikePending = likeDiary.isPending || unlikeDiary.isPending;

  // useCallback 으로 핸들러 참조를 안정화 — DiaryCard 는 React.memo 로
  // 감싸여 있어 부모 재렌더 시에도 props 가 같으면 재렌더를 건너뛴다.
  const handleLikeToggle = useCallback(
    (diary: ChallengeDiaryItem): void => {
      if (!isLoggedIn) {
        setShowLoginDialog(true);
        return;
      }

      if (isLikePending) {
        return;
      }
      if (diary.likeInfo.likedByMe) {
        unlikeDiary.mutate(diary.id);
      } else {
        likeDiary.mutate(diary.id);
      }
    },
    [isLoggedIn, isLikePending, likeDiary, unlikeDiary]
  );

  return (
    <div className="min-h-screen w-full">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {/* 모바일 sticky 헤더 — ← + 챌린지 일지 */}
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
          onClick={handleBack}
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
          챌린지 일지
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
              챌린지 일지
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              챌린지 참여자가 작성한 일지 목록입니다.
            </Text>
          </div>
        </header>

        {showSkeleton ? (
          <DiaryCardSkeletonGrid
            count={CHALLENGE_DIARY_PAGE_SIZE}
            className="data-fade-in mt-6"
          />
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
            {diaryItems.map((diary) => (
              <ChallengeDiaryListItem
                key={diary.id}
                diary={diary}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        ) : null}

        {!showSkeleton && !isError && !hasDiaries ? (
          <EmptyState
            variant="diary"
            title="아직 등록된 일지가 없어요"
            description="이 챌린지의 첫 일지를 남겨 보세요"
            className="mt-10"
          />
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
