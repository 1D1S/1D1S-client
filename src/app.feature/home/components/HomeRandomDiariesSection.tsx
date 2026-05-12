import { SectionHeader, Text } from '@1d1s/design-system';
import DiaryCard from '@component/cards/DiaryCard';
import { getCategoryLabel } from '@constants/categories';
import { type DiaryItem } from '@feature/diary/board/type/diary';
import {
  resolveDiaryImageList,
  resolveDiaryImageUrl,
} from '@feature/diary/shared/utils/diaryImageUrl';
import React from 'react';

import {
  getDiaryAchievementRate,
  mapFeelingToEmotion,
} from '../utils/homeFormatters';

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
    <section className="w-full">
      <SectionHeader
        title="오늘의 응원 한 마디"
        subtitle="응원의 ❤️ 한 번씩 눌러주세요"
        actionLabel="전체보기 →"
        onActionClick={onMoreClick}
      />
      {isLoading ? (
        <div className="flex w-full justify-center py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            일지를 불러오는 중입니다.
          </Text>
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center py-8">
          <Text size="body2" weight="medium" className="text-red-600">
            {errorMessage ?? '일지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!isLoading && !isError && diaries.length > 0 ? (
        <div
          className={
            'mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
          }
        >
          {diaries.slice(0, 8).map((item) => (
            <DiaryCard
              key={item.id}
              imageUrl={resolveDiaryImageList(item.imgUrl)?.[0]}
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
              user={item.authorInfoDto?.nickname ?? '익명'}
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
        <div className="flex w-full justify-center py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            표시할 일지가 없습니다.
          </Text>
        </div>
      ) : null}
    </section>
  );
}
