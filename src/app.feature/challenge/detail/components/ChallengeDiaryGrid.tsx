'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import { getCategoryLabel } from '@constants/categories';
import { Feeling } from '@feature/diary/board/type/diary';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '@feature/diary/shared/utils/diaryImageUrl';
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

function mapFeelingToEmotion(feeling: Feeling): 'happy' | 'soso' | 'sad' {
  if (feeling === 'HAPPY') {
    return 'happy';
  }
  if (feeling === 'SAD') {
    return 'sad';
  }
  return 'soso';
}

export function ChallengeDiaryGrid({
  diaries,
  isLoading,
  onDiaryClick,
  onLikeToggle,
  gridClassName = 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4',
  itemClassName,
}: ChallengeDiaryGridProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <Text size="body2" weight="medium" className="text-gray-500">
          일지를 불러오는 중입니다.
        </Text>
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
    <div className={gridClassName}>
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
