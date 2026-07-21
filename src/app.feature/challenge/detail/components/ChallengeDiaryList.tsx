'use client';

import { Button, Tag, Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import MasonryColumns from '@component/MasonryColumns';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import {
  useLikeDiary,
  useUnlikeDiary,
} from '@feature/diary/detail/hooks/useDiaryMutations';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { normalizeApiError } from '@module/api/error';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '@module/utils/diaryImageUrl';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

import { useChallengeDiaryListInfinite } from '../hooks/useChallengeDiaryQueries';
import { ChallengeDiaryItem } from '../type/challengeDiary';

const CHALLENGE_DIARY_PAGE_SIZE = 12;

interface ChallengeDiaryListProps {
  id: string;
  // 캘린더에서 넘어온 날짜 필터 (YYYY-MM-DD). 없으면 전체 목록.
  date?: string;
  // "필터 해제" 링크 목적지 — 라우트/탭에 따라 다르다.
  clearHref: string;
  // 기본 날짜 필터 칩 노출 여부. 상세 탭은 별도 필터 UI 를 쓰므로 끈다.
  showDefaultFilter?: boolean;
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
        content={diary.content}
        commentCount={diary.commentCount}
        goals={diary.diaryInfo?.diaryGoal}
        dateLabel={
          formatMonthDayKR(diary.diaryInfo?.challengedDate) || undefined
        }
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

/**
 * 챌린지 일지 리스트 본문 — 무한 스크롤 + 날짜 필터 칩 + 로딩/빈/에러 상태.
 * 상세 라우트(ChallengeDiaryListScreen)와 상세 탭(일지) 양쪽에서 재사용한다.
 */
export function ChallengeDiaryList({
  id,
  date,
  clearHref,
  showDefaultFilter = true,
}: ChallengeDiaryListProps): React.ReactElement {
  const challengeId = Number(id);
  // 잘못된 형식은 무시해 쿼리키/요청에 오염이 들어가지 않게 한다.
  const activeDate =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const filterLabel = activeDate ? formatMonthDayKR(activeDate) : '';
  const router = useRouter();
  // 'unknown'(세션 확인 중)에는 게스트 UI 를 그리지 않아 깜빡임을 막는다.
  const authStatus = useAuthStatus();
  const isLoggedIn = authStatus === 'authenticated';
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
  } = useChallengeDiaryListInfinite(
    challengeId,
    CHALLENGE_DIARY_PAGE_SIZE,
    activeDate,
    isLoggedIn
  );
  const showSkeleton = useMinimumLoading(
    isLoading || authStatus === 'unknown'
  );
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

  const handleGoLogin = useCallback((): void => {
    router.push(loginUrlFromCurrentLocation());
  }, [router]);

  // 일지 목록은 서버가 인증을 요구한다. 게스트는 요청을 보내지 않고
  // 탭 안에서 로그인 CTA 를 보여준다 (401 → 강제 리다이렉트 방지).
  if (authStatus === 'guest') {
    return (
      <EmptyState
        variant="diary"
        title="로그인이 필요해요"
        description="챌린지 일지는 로그인 후 확인할 수 있어요"
        action={
          <Button variant="primary" onClick={handleGoLogin}>
            로그인 하러가기
          </Button>
        }
        className="mt-10"
      />
    );
  }

  return (
    <>
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {showDefaultFilter && activeDate ? (
        <div className="flex items-center gap-2">
          <Tag tone="brand" size="sm">
            {filterLabel} 일지만 보기
          </Tag>
          <Link
            href={clearHref}
            className={cn(
              'text-[12px] text-gray-500 underline-offset-2',
              'hover:text-gray-700 hover:underline'
            )}
          >
            필터 해제
          </Link>
        </div>
      ) : null}

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
        <MasonryColumns className="data-fade-in mt-6">
          {diaryItems.map((diary) => (
            <ChallengeDiaryListItem
              key={diary.id}
              diary={diary}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </MasonryColumns>
      ) : null}

      {!showSkeleton && !isError && !hasDiaries ? (
        <EmptyState
          variant="diary"
          title={
            activeDate
              ? `${filterLabel}에 작성된 일지가 없어요`
              : '아직 등록된 일지가 없어요'
          }
          description={
            activeDate
              ? '다른 날짜를 선택하거나 필터를 해제해 보세요'
              : '이 챌린지의 첫 일지를 남겨 보세요'
          }
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
    </>
  );
}
