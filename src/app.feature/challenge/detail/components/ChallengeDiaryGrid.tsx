'use client';

import DiaryCard from '@component/cards/DiaryCard';
import EmptyState from '@component/EmptyState';
import { DiaryCardSkeleton } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '@module/utils/diaryImageUrl';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React from 'react';

import { ChallengeDiaryItem } from '../type/challengeDiary';

interface ChallengeDiaryGridProps {
  diaries: ChallengeDiaryItem[];
  isLoading: boolean;
  onLikeToggle(diary: ChallengeDiaryItem): void;
  gridClassName?: string;
  itemClassName?: string;
}

export function ChallengeDiaryGrid({
  diaries,
  isLoading,
  onLikeToggle,
  gridClassName = cn(
    'grid grid-cols-2 items-start gap-2.5',
    'sm:grid-cols-3 sm:gap-3'
  ),
  itemClassName,
}: ChallengeDiaryGridProps): React.ReactElement {
  const showSkeleton = useMinimumLoading(isLoading);
  if (showSkeleton) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={itemClassName}>
            <DiaryCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (diaries.length === 0) {
    return (
      <EmptyState
        variant="diary"
        title="아직 등록된 일지가 없어요"
        description="이 챌린지의 첫 일지를 남겨 보세요"
      />
    );
  }

  return (
    <div className={cn(gridClassName, 'data-fade-in')}>
      {diaries.map((diary) => (
        <div key={diary.id} className={itemClassName}>
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
            user={diary.author?.nickname || '익명'}
            challengeLabel={
              diary.challenge?.title ||
              getCategoryLabel(diary.challenge?.category) ||
              '챌린지'
            }
            emotion={mapFeelingToEmotion(diary.diaryInfo?.feeling ?? 'NONE')}
            href={`/diary/${diary.id}`}
            onLikeToggle={() => onLikeToggle(diary)}
          />
        </div>
      ))}
    </div>
  );
}
