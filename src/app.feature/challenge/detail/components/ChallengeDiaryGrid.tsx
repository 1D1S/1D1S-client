'use client';

import { Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import { getCategoryLabel } from '@constants/categories';
import { Feeling } from '@feature/diary/board/type/diary';
import { getRelativeDiaryDateLabel } from '@feature/diary/shared/utils/diaryRelativeTime';
import React from 'react';

import { ChallengeDiaryItem } from '../type/challengeDiary';

interface ChallengeDiaryGridProps {
  diaries: ChallengeDiaryItem[];
  isLoading: boolean;
  onDiaryClick(diaryId: number): void;
  onLikeToggle(diary: ChallengeDiaryItem): void;
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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {diaries.map((diary) => (
        <DiaryCard
          key={diary.id}
          imageUrl={diary.imgUrl?.[0]}
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
          date={getRelativeDiaryDateLabel(
            diary.diaryInfo?.createdAt ??
              diary.diaryInfo?.challengedDate ??
              ''
          )}
          emotion={mapFeelingToEmotion(diary.diaryInfo?.feeling ?? 'NONE')}
          onClick={() => onDiaryClick(diary.id)}
          onLikeToggle={() => onLikeToggle(diary)}
        />
      ))}
    </div>
  );
}
