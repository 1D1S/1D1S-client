import { SectionHeader, Text } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import { ChallengeCardSkeleton } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { type ChallengeListItem } from '@feature/challenge/board/type/challenge';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challengePeriod';
import { cn } from '@module/utils/cn';
import React from 'react';

import {
  formatChallengeRemainingLabel,
  isChallengeEnded,
} from '../utils/homeFormatters';

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
    <section className="w-full">
      <SectionHeader
        title="오늘 시작해볼 챌린지"
        subtitle="함께 도전할 친구를 찾아보세요"
        actionLabel="전체보기 →"
        onActionClick={onMoreClick}
      />
      {isLoading ? (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide',
            'sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0',
            'sm:py-0 lg:grid-cols-4'
          )}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[200px] shrink-0 sm:w-auto sm:shrink">
              <ChallengeCardSkeleton />
            </div>
          ))}
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center py-8">
          <Text size="body2" weight="medium" className="text-red-600">
            {errorMessage ?? '챌린지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!isLoading && !isError && challenges.length > 0 ? (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide data-fade-in',
            'sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0',
            'sm:py-0 lg:grid-cols-4'
          )}
        >
          {challenges.map((challenge) => {
            const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
            const ended = isChallengeEnded(challenge.endDate);
            const remainingLabel = formatChallengeRemainingLabel(
              challenge.endDate,
              isInfinite,
              ended
            );

            return (
              <div
                key={challenge.challengeId}
                className="w-[200px] shrink-0 sm:w-auto sm:shrink"
              >
                <ChallengeCard
                  title={challenge.title}
                  category={getCategoryLabel(challenge.category)}
                  categoryIcon={
                    <CategoryIcon
                      category={challenge.category}
                      className="h-3 w-3"
                    />
                  }
                  stripeTone={getCategoryStripeTone(challenge.category)}
                  imageUrl={challenge.thumbnailImage}
                  currentParticipantCount={challenge.participantCnt}
                  maxParticipantCount={challenge.maxParticipantCnt}
                  remainingLabel={remainingLabel}
                  startDate={challenge.startDate}
                  endDate={challenge.endDate}
                  isInfinite={isInfinite}
                  goalType={challenge.goalType}
                  isGroup={challenge.participationType === 'GROUP'}
                  isEnded={ended}
                  participants={challenge.randomParticipants}
                  onClick={() => onChallengeClick(challenge.challengeId)}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      {!isLoading && !isError && challenges.length === 0 ? (
        <div className="flex w-full justify-center py-8">
          <Text size="body2" weight="medium" className="text-gray-500">
            표시할 챌린지가 없습니다.
          </Text>
        </div>
      ) : null}
    </section>
  );
}
