'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import MasonryColumns from '@component/MasonryColumns';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { useLikeToggle } from '@feature/diary/board/hooks/useLikeToggle';
import { DiaryItem } from '@feature/diary/board/type/diary';
import {
  resolveDiaryImageUrl,
  resolveDiaryThumbnail,
} from '@feature/diary/shared/utils/diaryImageUrl';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useMemberProfileDiariesInfinite } from '@feature/member/hooks/useMemberQueries';
import { normalizeApiError } from '@module/api/error';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

const MEMBER_DIARY_PAGE_SIZE = 12;

interface MemberDiaryListItemProps {
  item: DiaryItem;
  onLikeToggle(diary: DiaryItem): void;
}

// React.memo로 감싸 부모 재렌더 시 동일 item 카드는 재렌더를 건너뛴다.
// 부모는 onLikeToggle을 useCallback으로 안정화해야 한다.
const MemberDiaryListItem = React.memo(
  ({ item, onLikeToggle }: MemberDiaryListItemProps): React.ReactElement => {
    const handleLike = useCallback(() => {
      onLikeToggle(item);
    }, [onLikeToggle, item]);

    const achievementRate = Math.min(
      100,
      Math.max(
        0,
        item.achievementRate ?? item.diaryInfoDto?.achievementRate ?? 0
      )
    );

    return (
      <DiaryCard
        imageUrl={resolveDiaryThumbnail(item.thumbnailUrl)}
        profileImageUrl={
          resolveDiaryImageUrl(item.authorInfoDto?.profileImage) ?? undefined
        }
        percent={achievementRate}
        isLiked={item.likeInfo.likedByMe}
        likes={item.likeInfo.likeCnt}
        title={item.title}
        content={item.content}
        commentCount={item.commentCount}
        goals={item.diaryInfoDto?.diaryGoal}
        dateLabel={
          formatMonthDayKR(item.diaryInfoDto?.challengedDate) || undefined
        }
        user={item.authorInfoDto?.nickname ?? '익명'}
        challengeLabel={
          item.challenge?.title ||
          getCategoryLabel(item.challenge?.category) ||
          '일지'
        }
        emotion={mapFeelingToEmotion(item.diaryInfoDto?.feeling ?? 'NONE')}
        href={`/diary/${item.id}`}
        onLikeToggle={handleLike}
      />
    );
  }
);
MemberDiaryListItem.displayName = 'MemberDiaryListItem';

interface MemberDiaryListScreenProps {
  memberId: string;
}

export function MemberDiaryListScreen({
  memberId,
}: MemberDiaryListScreenProps): React.ReactElement {
  const memberIdNum = Number(memberId);
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const openLoginDialog = useCallback((): void => {
    setShowLoginDialog(true);
  }, []);
  const { toggleLike } = useLikeToggle({
    isLoggedIn,
    onRequireLogin: openLoginDialog,
  });
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMemberProfileDiariesInfinite(memberIdNum, MEMBER_DIARY_PAGE_SIZE);
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const diaryItems = useMemo(() => {
    const flattened =
      data?.pages?.flatMap((page) => page?.diaryList?.items ?? []) ?? [];
    const diaryMap = new Map<number, DiaryItem>();
    flattened.forEach((diary) => {
      diaryMap.set(diary.id, diary);
    });
    return Array.from(diaryMap.values());
  }, [data]);

  const hasDiaries = diaryItems.length > 0;

  const handleLikeToggle = useCallback(
    (diary: DiaryItem): void =>
      toggleLike(diary.id, diary.likeInfo.likedByMe),
    [toggleLike]
  );

  return (
    <div className="min-h-screen w-full">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {/* 모바일 sticky 헤더 — ← + 일지 전체 보기 */}
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
          onClick={() => router.push(`/member/${memberId}`)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="heading2"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          일지 전체 보기
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
              일지 전체 보기
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              작성한 일지 전체 목록입니다.
            </Text>
          </div>
        </header>

        {showSkeleton ? (
          <DiaryCardSkeletonGrid
            count={MEMBER_DIARY_PAGE_SIZE}
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
          <MasonryColumns className="data-fade-in mt-6">
            {diaryItems.map((diary) => (
              <MemberDiaryListItem
                key={diary.id}
                item={diary}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </MasonryColumns>
        ) : null}

        {!showSkeleton && !isError && !hasDiaries ? (
          <EmptyState
            variant="diary"
            title="아직 작성한 일지가 없어요"
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
