import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import { type ChallengeListItem } from '@feature/challenge/board/type/challenge';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challengePeriod';
import React from 'react';

import {
  formatChallengeRemainingLabel,
  isChallengeEnded,
} from '../utils/homeFormatters';
import HomeChallengeMiniCard from './HomeChallengeMiniCard';
import HomeSectionHeader from './HomeSectionHeader';

interface HomeRandomChallengesSectionProps {
  challenges: ChallengeListItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onMoreClick(): void;
  onChallengeClick(challengeId: number): void;
}

export default function HomeRandomChallengesSection({
  challenges,
  isLoading,
  isError,
  errorMessage,
  onMoreClick,
  onChallengeClick,
}: HomeRandomChallengesSectionProps): React.ReactElement {
  return (
    <>
      <HomeSectionHeader
        title="오늘의 추천 챌린지"
        subtitle="함께 도전할 친구를 찾아보세요"
        emoji="🎯"
        onMoreClick={onMoreClick}
      />
      <div className="h-3" />
      {isLoading ? (
        <div className="flex w-full justify-center px-5 py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            챌린지를 불러오는 중입니다.
          </Text>
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center px-5 py-8">
          <Text size="body2" weight="medium" className="text-red-600">
            {errorMessage ?? '챌린지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!isLoading && !isError && challenges.length > 0 ? (
        <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-5 pb-1">
          {challenges.map((challenge) => {
            const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
            const ended = isChallengeEnded(challenge.endDate);
            const remainingLabel = formatChallengeRemainingLabel(
              challenge.endDate,
              isInfinite,
              ended
            );

            return (
              <HomeChallengeMiniCard
                key={challenge.challengeId}
                title={challenge.title}
                category={getCategoryLabel(challenge.category)}
                imageUrl={challenge.thumbnailImage}
                currentParticipantCount={challenge.participantCnt}
                maxParticipantCount={challenge.maxParticipantCnt}
                remainingLabel={remainingLabel}
                onClick={() => onChallengeClick(challenge.challengeId)}
              />
            );
          })}
        </div>
      ) : null}
      {!isLoading && !isError && challenges.length === 0 ? (
        <div className="flex w-full justify-center px-5 py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            표시할 챌린지가 없습니다.
          </Text>
        </div>
      ) : null}
    </>
  );
}
