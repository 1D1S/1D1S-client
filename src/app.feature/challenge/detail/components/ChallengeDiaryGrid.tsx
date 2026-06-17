'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import { DiaryCardSkeleton } from '@component/skeletons/DiaryCardSkeleton';
import { getCategoryLabel } from '@constants/categories';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '@feature/diary/shared/utils/diaryImageUrl';
import { mapFeelingToEmotion } from '@feature/diary/shared/utils/feeling';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React from 'react';

import { ChallengeDiaryItem } from '../type/challengeDiary';

interface ChallengeDiaryGridProps {
  diaries: ChallengeDiaryItem[];
  isLoading: boolean;
  onDiaryClick(diaryId: number): void;
  onLikeToggle(diary: ChallengeDiaryItem): void;
  gridClassName?: string;
  itemClassName?: string;
}

export function ChallengeDiaryGrid({
  diaries,
  isLoading,
  onDiaryClick,
  onLikeToggle,
  gridClassName = 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4',
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
      <div className="flex w-full justify-center py-8">
        <Text size="body2" weight="medium" className="text-gray-500">
          아직 등록된 일지가 없습니다.
        </Text>
      </div>
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
            user={diary.author?.nickname || '익명'}
            challengeLabel={
              diary.challenge?.title ||
              getCategoryLabel(diary.challenge?.category) ||
              '챌린지'
            }
            emotion={mapFeelingToEmotion(diary.diaryInfo?.feeling ?? 'NONE')}
            onClick={() => onDiaryClick(diary.id)}
            onLikeToggle={() => onLikeToggle(diary)}
          />
        </div>
      ))}
    </div>
  );
}
