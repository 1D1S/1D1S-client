'use client';

import { Icon, Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import MasonryColumns from '@component/MasonryColumns';
import { DiaryCardSkeletonGrid } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { normalizeApiError } from '@module/api/error';
import { useDedupedInfinitePages } from '@module/hooks/useDedupedInfinitePages';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useLoginRequiredParam } from '@module/hooks/useLoginRequiredParam';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR, getDateTimestamp } from '@module/utils/date';
import {
  resolveDiaryImageUrl,
  resolveDiaryThumbnail,
} from '@module/utils/diaryImageUrl';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';

import { mapFeelingToEmotion } from '../../shared/utils/feeling';
import { DiaryInfiniteFooter } from '../components/DiaryInfiniteFooter';
import { useDiaryList } from '../hooks/useDiaryQueries';
import { useLikeToggle } from '../hooks/useLikeToggle';
import { type DiaryItem } from '../type/diary';

type SortMode = 'latest' | 'likes';

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
    const leftDiaryInfo = leftDiary.diaryInfoDto ?? leftDiary.diaryInfo ?? null;
    const rightDiaryInfo =
      rightDiary.diaryInfoDto ?? rightDiary.diaryInfo ?? null;
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
  return diary.authorInfoDto ?? diary.author ?? null;
}

function getDiaryInfo(diary: DiaryItem): DiaryItem['diaryInfoDto'] {
  return diary.diaryInfoDto ?? diary.diaryInfo ?? null;
}

function getDiaryAchievementRate(diary: DiaryItem): number {
  const diaryInfo = getDiaryInfo(diary);
  const rawAchievementRate =
    diary.achievementRate ?? diaryInfo?.achievementRate ?? 0;

  return Math.min(100, Math.max(0, rawAchievementRate));
}

interface DiaryListItemProps {
  item: DiaryItem;
  /** 로그인 시 상세 링크. 비로그인 시 undefined + onRequireLogin 사용. */
  href?: string;
  onRequireLogin(): void;
  onLikeToggle(diary: DiaryItem): void;
}

// 매 렌더마다 `() => handleCardClick(item.id)` 같은 인라인 람다를 만들지 않고,
// 안정적인 핸들러와 item 만 props 로 받는다. React.memo 로 감싸 부모(보드)가
// 재렌더돼도 동일 item 카드는 재렌더를 건너뛴다.
const DiaryListItem = React.memo(
  ({
    item,
    href,
    onRequireLogin,
    onLikeToggle,
  }: DiaryListItemProps): React.ReactElement => {
    const diaryInfo = getDiaryInfo(item);
    const authorInfo = getDiaryAuthorInfo(item);

    // 얇은 어댑터 — 안정적인 onLikeToggle 에 item 을 바인딩만 한다.
    // 이 컴포넌트는 React.memo 라 item/props 가 바뀔 때만 재렌더되므로,
    // 매 렌더 새 함수가 생겨도 DiaryCard 메모를 유의미하게 깨뜨리지 않는다.
    const handleLike = (): void => {
      onLikeToggle(item);
    };

    return (
      <div className="min-w-0">
        <DiaryCard
          imageUrl={resolveDiaryThumbnail(item.thumbnailUrl)}
          profileImageUrl={
            resolveDiaryImageUrl(authorInfo?.profileImage) ?? undefined
          }
          percent={getDiaryAchievementRate(item)}
          isLiked={item.likeInfo.likedByMe}
          likes={item.likeInfo.likeCnt}
          title={item.title}
          content={item.content}
          commentCount={item.commentCount}
          goals={diaryInfo?.diaryGoal}
          dateLabel={formatMonthDayKR(diaryInfo?.challengedDate) || undefined}
          user={authorInfo?.nickname ?? '익명'}
          challengeLabel={
            item.challenge?.title ||
            getCategoryLabel(item.challenge?.category) ||
            '챌린지'
          }
          emotion={mapFeelingToEmotion(diaryInfo?.feeling ?? 'NONE')}
          href={href}
          onLikeToggle={handleLike}
          onClick={onRequireLogin}
        />
      </div>
    );
  }
);
DiaryListItem.displayName = 'DiaryListItem';

export default function DiaryListScreen(): React.ReactElement {
  const router = useRouter();
  const { isLoginRequired, returnTo } = useLoginRequiredParam();
  const isLoggedIn = useIsLoggedIn();
  const [sortMode] = useState<SortMode>('latest');
  // isLoginRequired는 URL 파라미터로 첫 렌더에만 true가 되고 즉시 삭제된다.
  // initializer로 초기값만 반영하면 충분하다.
  const [showLoginDialog, setShowLoginDialog] = useState(
    () => isLoginRequired && !isLoggedIn
  );
  // 상세 → 목록 바운스 시 원래 가려던 상세 경로. 로그인 후 그리로 복귀한다.
  const [loginReturnTo, setLoginReturnTo] = useState<string | null>(() =>
    isLoginRequired && !isLoggedIn ? returnTo : null
  );
  const [loginDialogDescription, setLoginDialogDescription] = useState(() =>
    isLoginRequired && !isLoggedIn
      ? '일지 상세는 로그인 후 이용할 수 있습니다.'
      : '로그인 후 이용할 수 있습니다.'
  );

  const handleLikeRequireLogin = useCallback((): void => {
    setLoginDialogDescription('좋아요 기능은 로그인 후 이용할 수 있습니다.');
    setShowLoginDialog(true);
  }, []);
  const { toggleLike } = useLikeToggle({
    isLoggedIn,
    onRequireLogin: handleLikeRequireLogin,
  });
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiaryList({ size: 12 });
  const showSkeleton = useMinimumLoading(isLoading);
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });
  const diaries = useDedupedInfinitePages(
    data,
    (page) => page?.items,
    (diary) => diary.id
  );

  const sortedDiaries = useMemo(
    () => sortDiaries(diaries, sortMode),
    [diaries, sortMode]
  );
  const hasLoadedDiaries = sortedDiaries.length > 0;

  // useCallback 으로 핸들러 참조를 안정화 — DiaryCard 는 React.memo 로
  // 감싸여 있어 부모 재렌더 시에도 props 가 같으면 재렌더를 건너뛴다.
  // 로그인 시 카드 자체가 Link(prefetch)로 이동하므로 비로그인 유도만 남는다.
  const handleRequireLogin = useCallback((): void => {
    setLoginDialogDescription('일지 상세는 로그인 후 이용할 수 있습니다.');
    setShowLoginDialog(true);
  }, []);

  const handleLikeToggle = useCallback(
    (diary: DiaryItem): void =>
      toggleLike(diary.id, diary.likeInfo.likedByMe),
    [toggleLike]
  );

  return (
    <BoardScreenLayout
      title="일지 보드"
      description="다른 챌린저의 일지를 보며 동기부여를 얻어보세요."
      mobileHeader={
        // 모바일 sticky 헤더 — 일지.
        // 네이티브 쉘은 AppTopNav 가 같은 영역을 차지하고 FAB 가
        // "일지 추가" 를 제공하므로, 이 헤더는 글로벌 sticky 차단 룰로
        // 함께 가린다 (data-native-keep 제거).
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
              data-native-hide
              className={cn(
                // 챌린지 보드의 "새 챌린지" 버튼과 동일한 모바일 CTA 스타일
                'bg-brand inline-flex shrink-0 items-center gap-1 rounded-full',
                'px-3 py-1.5 text-[11px] font-extrabold text-white',
                'transition hover:brightness-105'
              )}
            >
              <Icon name="Plus" size={12} aria-hidden />
              일지 쓰기
            </button>
          ) : null}
        </div>
      }
    >
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={(open) => {
          setShowLoginDialog(open);
          if (!open) {
            setLoginReturnTo(null);
          }
        }}
        description={loginDialogDescription}
        returnTo={loginReturnTo}
      />

      {showSkeleton ? (
        <DiaryCardSkeletonGrid count={12} className="data-fade-in native-flush-top mt-6" />
      ) : null}

      {isError && !hasLoadedDiaries ? (
        <div className="native-flush-top mt-10 flex w-full justify-center py-10">
          <Text size="body1" weight="medium" className="text-red-600">
            {error
              ? normalizeApiError(error).message
              : '일지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}

      {!showSkeleton && hasLoadedDiaries ? (
        <MasonryColumns className="data-fade-in native-flush-top mt-6">
          {sortedDiaries.map((item) => (
            <DiaryListItem
              key={item.id}
              item={item}
              href={isLoggedIn ? `/diary/${item.id}` : undefined}
              onRequireLogin={handleRequireLogin}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </MasonryColumns>
      ) : null}

      {!showSkeleton && !isError && !hasLoadedDiaries ? (
        <EmptyState
          variant="diary"
          title="아직 등록된 일지가 없어요"
          description="첫 일지를 남기고 스트릭을 시작해 보세요"
          className="native-flush-top mt-10"
        />
      ) : null}

      <DiaryInfiniteFooter
        sentinelRef={ref}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        error={error}
        hasItems={hasLoadedDiaries}
        hasNextPage={hasNextPage ?? false}
      />
    </BoardScreenLayout>
  );
}
