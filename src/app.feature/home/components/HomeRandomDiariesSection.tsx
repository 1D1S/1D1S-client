import { SectionHeader, Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import MasonryColumns from '@component/MasonryColumns';
import { DiaryCardSkeleton } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { type DiaryItem } from '@feature/diary/board/type/diary';
import {
  resolveDiaryImageUrl,
  resolveDiaryThumbnail,
} from '@feature/diary/shared/utils/diaryImageUrl';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React, { useCallback } from 'react';

import {
  getDiaryAchievementRate,
  mapFeelingToEmotion,
} from '../utils/homeFormatters';

interface HomeDiaryItemProps {
  item: DiaryItem;
  /** 로그인 시 상세 링크. 비로그인 시 undefined + onRequireLogin 사용. */
  href?: string;
  onRequireLogin(): void;
  onLikeToggle(diary: DiaryItem): void;
}

// 매 렌더마다 인라인 람다를 새로 만들지 않도록 안정적인 핸들러와 item 만
// props 로 받는다. React.memo 로 감싸 부모 섹션이 재렌더돼도 동일 item
// 카드는 재렌더를 건너뛴다 (좋아요 1건이 8장 전체를 재렌더하지 않음).
const HomeDiaryItem = React.memo(
  ({
    item,
    href,
    onRequireLogin,
    onLikeToggle,
  }: HomeDiaryItemProps): React.ReactElement => {
    const handleLike = useCallback(() => {
      onLikeToggle(item);
    }, [onLikeToggle, item]);

    return (
      <DiaryCard
        imageUrl={resolveDiaryThumbnail(item.thumbnailUrl)}
        profileImageUrl={
          resolveDiaryImageUrl(item.authorInfoDto?.profileImage) ??
          undefined
        }
        percent={getDiaryAchievementRate(
          item.achievementRate,
          item.diaryInfoDto?.achievementRate
        )}
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
          '챌린지'
        }
        emotion={mapFeelingToEmotion(item.diaryInfoDto?.feeling ?? 'NONE')}
        href={href}
        onClick={onRequireLogin}
        onLikeToggle={handleLike}
      />
    );
  }
);
HomeDiaryItem.displayName = 'HomeDiaryItem';

interface HomeRandomDiariesSectionProps {
  diaries: DiaryItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  /** 로그인 시 카드가 상세 Link(prefetch)로, 비로그인 시 로그인 유도로 동작 */
  isLoggedIn: boolean;
  onMoreClick(): void;
  onRequireLogin(): void;
  onLikeToggle(diary: DiaryItem): void;
}

export default function HomeRandomDiariesSection({
  diaries,
  isLoading,
  isError,
  errorMessage,
  isLoggedIn,
  onMoreClick,
  onRequireLogin,
  onLikeToggle,
}: HomeRandomDiariesSectionProps): React.ReactElement {
  const showSkeleton = useMinimumLoading(isLoading);
  return (
    <section className="w-full">
      <SectionHeader
        title="오늘의 응원 한 마디"
        subtitle="응원의 ❤️ 한 번씩 눌러주세요"
        actionLabel="전체보기 →"
        onActionClick={onMoreClick}
        className="[&_h2]:!text-2xl [&_h2]:!tracking-tight"
      />
      {showSkeleton ? (
        <div
          className={cn(
            'mt-4 grid grid-cols-2 items-start gap-2.5',
            'sm:grid-cols-3 sm:gap-3'
          )}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <DiaryCardSkeleton key={index} />
          ))}
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center py-8">
          <Text size="body2" weight="medium" className="text-red-600">
            {errorMessage ?? '일지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!showSkeleton && !isError && diaries.length > 0 ? (
        <MasonryColumns
          className="data-fade-in mt-4"
          gapClassName="gap-2.5 sm:gap-3"
        >
          {diaries.slice(0, 8).map((item) => (
            <HomeDiaryItem
              key={item.id}
              item={item}
              href={isLoggedIn ? `/diary/${item.id}` : undefined}
              onRequireLogin={onRequireLogin}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </MasonryColumns>
      ) : null}
      {!showSkeleton && !isError && diaries.length === 0 ? (
        <EmptyState variant="diary" title="표시할 일지가 없어요" className="py-8" />
      ) : null}
    </section>
  );
}
