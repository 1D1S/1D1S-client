import { DiaryCard, Text } from '@1d1s/design-system';
import { type DiaryItem } from '@feature/diary/board/type/diary';
import React from 'react';

import {
  getDiaryAchievementRate,
  mapFeelingToEmotion,
  toRelativeDateLabel,
} from '../utils/home-formatters';
import HomeSectionHeader from './home-section-header';

interface HomeRandomDiariesSectionProps {
  diaries: DiaryItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isLikePending: boolean;
  onMoreClick(): void;
  onDiaryClick(diaryId: number): void;
  onLikeToggle(diary: DiaryItem): void;
  onChallengeClick(challengeId?: number): void;
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
  onChallengeClick,
}: HomeRandomDiariesSectionProps): React.ReactElement {
  return (
    <>
      <HomeSectionHeader
        title="랜덤 일지"
        subtitle="챌린저들의 일지를 보며 의욕을 충전해봐요."
        onMoreClick={onMoreClick}
      />
      <div className="h-4" />
      {isLoading ? (
        <div className="flex w-full justify-center px-4 py-8">
          <Text size="body1" weight="medium" className="text-gray-500">
            일지를 불러오는 중입니다.
          </Text>
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center px-4 py-8">
          <Text size="body1" weight="medium" className="text-red-600">
            {errorMessage ?? '일지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!isLoading && !isError ? (
        <div className="diary-grid-container px-4 pb-4">
          <div className="diary-card-grid grid grid-cols-2 gap-3">
            {diaries.map((item) => (
              <div key={item.id} className="min-w-0 self-start">
                <DiaryCard
                  imageUrl={item.imgUrl?.[0] ?? '/images/default-card.png'}
                  percent={getDiaryAchievementRate(
                    item.achievementRate,
                    item.diaryInfoDto?.achievementRate
                  )}
                  isLiked={item.likeInfo.likedByMe}
                  likes={item.likeInfo.likeCnt}
                  title={item.title}
                  user={item.authorInfoDto?.nickname ?? '익명'}
                  userImage={
                    item.authorInfoDto?.profileImage ??
                    '/images/default-profile.png'
                  }
                  challengeLabel={
                    item.challenge?.title ??
                    item.challenge?.category ??
                    '챌린지'
                  }
                  onChallengeClick={() =>
                    onChallengeClick(item.challenge?.challengeId)
                  }
                  date={toRelativeDateLabel(item.diaryInfoDto?.createdAt ?? '')}
                  emotion={mapFeelingToEmotion(
                    item.diaryInfoDto?.feeling ?? 'NONE'
                  )}
                  onLikeToggle={() => {
                    if (isLikePending) {
                      return;
                    }

                    onLikeToggle(item);
                  }}
                  onClick={() => onDiaryClick(item.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {!isLoading && !isError && diaries.length === 0 ? (
        <div className="flex w-full justify-center px-4 py-8">
          <Text size="body1" weight="medium" className="text-gray-500">
            표시할 일지가 없습니다.
          </Text>
        </div>
      ) : null}
    </>
  );
}
