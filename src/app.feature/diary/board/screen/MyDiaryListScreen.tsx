'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { MobileStickyHeader } from '@component/layout/MobileStickyHeader';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import MasonryColumns from '@component/MasonryColumns';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { normalizeApiError } from '@module/api/error';
import { useDedupedInfinitePages } from '@module/hooks/useDedupedInfinitePages';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

import {
  buildDiaryCardViewModels,
  DiaryCardViewModel,
} from '../../../member/mypage/utils/mypageUtils';
import { DiaryInfiniteFooter } from '../components/DiaryInfiniteFooter';
import { useMyDiariesInfinite } from '../hooks/useDiaryQueries';
import { useLikeToggle } from '../hooks/useLikeToggle';

const MY_DIARY_PAGE_SIZE = 12;

interface MyDiaryListItemProps {
  item: DiaryCardViewModel;
  onLikeToggle(id: number, isLiked: boolean): void;
}

// React.memo로 감싸 부모 재렌더 시 동일 item 카드는 재렌더를 건너뛴다.
// 부모는 onLikeToggle을 useCallback으로 안정화해야 한다.
const MyDiaryListItem = React.memo(
  ({ item, onLikeToggle }: MyDiaryListItemProps): React.ReactElement => {
    const handleLike = useCallback(() => {
      onLikeToggle(item.id, item.isLiked);
    }, [onLikeToggle, item.id, item.isLiked]);

    return (
      <DiaryCard
        imageUrl={item.imageUrl}
        profileImageUrl={item.profileImageUrl}
        percent={item.percent}
        isLiked={item.isLiked}
        likes={item.likes}
        title={item.title}
        content={item.content}
        commentCount={item.commentCount}
        goals={item.goals}
        dateLabel={item.date || undefined}
        user={item.user}
        challengeLabel={item.challengeLabel}
        emotion={item.emotion}
        href={`/diary/${item.id}`}
        onLikeToggle={handleLike}
      />
    );
  }
);
MyDiaryListItem.displayName = 'MyDiaryListItem';

export function MyDiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { data: sidebar } = useSidebar();
  const nickname = sidebar?.nickname ?? '나';
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const openLoginDialog = useCallback((): void => {
    setShowLoginDialog(true);
  }, []);
  const { toggleLike: handleLikeToggle } = useLikeToggle({
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
  } = useMyDiariesInfinite(MY_DIARY_PAGE_SIZE);
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const diaryItems = useDedupedInfinitePages(
    data,
    (page) => page?.items,
    (diary) => diary.id
  );

  const diaryCards = useMemo(
    () => buildDiaryCardViewModels(diaryItems, nickname),
    [diaryItems, nickname]
  );

  const hasDiaries = diaryCards.length > 0;

  return (
    <BoardScreenLayout
      title="내 일지"
      description="내가 작성한 일지 전체 목록입니다."
      mobileHeader={
        <MobileStickyHeader title="내 일지" onBack={() => router.back()} />
      }
    >
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {showSkeleton ? (
        <DiaryCardSkeletonGrid
          count={MY_DIARY_PAGE_SIZE}
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
          {diaryCards.map((diary) => (
            <MyDiaryListItem
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
          description="첫 일지를 남기고 기록을 시작해 보세요"
          className="mt-10"
        />
      ) : null}

      <DiaryInfiniteFooter
        sentinelRef={ref}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        error={error}
        hasItems={hasDiaries}
        hasNextPage={hasNextPage ?? false}
      />
    </BoardScreenLayout>
  );
}
