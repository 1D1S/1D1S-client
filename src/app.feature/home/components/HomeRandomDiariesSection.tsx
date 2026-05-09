import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import { type DiaryItem } from '@feature/diary/board/type/diary';
import React from 'react';

import {
  getDiaryAchievementRate,
  mapFeelingToEmotion,
  toRelativeDateLabel,
} from '../utils/homeFormatters';
import HomeDiaryMiniCard from './HomeDiaryMiniCard';
import HomeSectionHeader from './HomeSectionHeader';

interface HomeRandomDiariesSectionProps {
  diaries: DiaryItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isLikePending: boolean;
  onMoreClick(): void;
  onDiaryClick(diaryId: number): void;
  onLikeToggle(diary: DiaryItem): void;
}

export default function HomeRandomDiariesSection({
  diaries,
  isLoading,
  isError,
  errorMessage,
  isLikePending,
  onMoreClick,
  onDiaryClick,
  onLikeToggle,
}: HomeRandomDiariesSectionProps): React.ReactElement {
  return (
    <>
      <HomeSectionHeader
        title="오늘의 일지"
        subtitle="응원의 ❤️ 한 번씩 눌러주세요"
        emoji="📖"
        onMoreClick={onMoreClick}
      />
      <div className="h-3" />
      {isLoading ? (
        <div className="flex w-full justify-center px-5 py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            일지를 불러오는 중입니다.
          </Text>
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center px-5 py-8">
          <Text size="body2" weight="medium" className="text-red-600">
            {errorMessage ?? '일지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!isLoading && !isError && diaries.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-5 pb-1 sm:grid-cols-3 xl:grid-cols-4">
          {diaries.slice(0, 8).map((item) => (
            <HomeDiaryMiniCard
              key={item.id}
              imageUrl={item.imgUrl?.[0]}
              percent={getDiaryAchievementRate(
                item.achievementRate,
                item.diaryInfoDto?.achievementRate
              )}
              isLiked={item.likeInfo.likedByMe}
              likes={item.likeInfo.likeCnt}
              title={item.title}
              user={item.authorInfoDto?.nickname ?? '익명'}
              date={toRelativeDateLabel(item.diaryInfoDto?.createdAt ?? '')}
              challengeLabel={
                item.challenge?.title ||
                getCategoryLabel(item.challenge?.category) ||
                '챌린지'
              }
              emotion={mapFeelingToEmotion(
                item.diaryInfoDto?.feeling ?? 'NONE'
              )}
              onClick={() => onDiaryClick(item.id)}
              onLikeToggle={() => {
                if (isLikePending) {
                  return;
                }
                onLikeToggle(item);
              }}
            />
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && diaries.length === 0 ? (
        <div className="flex w-full justify-center px-5 py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            표시할 일지가 없습니다.
          </Text>
        </div>
      ) : null}
    </>
  );
}
