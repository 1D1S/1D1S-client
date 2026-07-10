'use client';

import { MobileHeader, Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import MasonryColumns from '@component/MasonryColumns';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { useLikeToggle } from '@feature/diary/board/hooks/useLikeToggle';
import { DiaryItem } from '@feature/diary/board/type/diary';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useMemberProfileDiariesInfinite } from '@feature/member/hooks/useMemberQueries';
import { normalizeApiError } from '@module/api/error';
import { useDedupedInfinitePages } from '@module/hooks/useDedupedInfinitePages';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { formatMonthDayKR } from '@module/utils/date';
import {
  resolveDiaryImageUrl,
  resolveDiaryThumbnail,
} from '@module/utils/diaryImageUrl';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import { DiaryInfiniteFooter } from '../components/DiaryInfiniteFooter';

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

  const diaryItems = useDedupedInfinitePages(
    data,
    (page) => page?.diaryList?.items,
    (diary) => diary.id
  );

  const hasDiaries = diaryItems.length > 0;

  const handleLikeToggle = useCallback(
    (diary: DiaryItem): void =>
      toggleLike(diary.id, diary.likeInfo.likedByMe),
    [toggleLike]
  );

  return (
    <BoardScreenLayout
      title="일지 전체 보기"
      description="작성한 일지 전체 목록입니다."
      mobileHeader={
        <MobileHeader
          title="일지 전체 보기"
          onBack={() => router.push(`/member/${memberId}`)}
        />
      }
    >
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

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
