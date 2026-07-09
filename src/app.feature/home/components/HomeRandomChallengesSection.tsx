import { SectionHeader, Text } from '@1d1s/design-system';
import ChallengeCard from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import { ChallengeCardSkeleton } from '@component/skeletons/ChallengeCardSkeleton';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import { type ChallengeListItem } from '@feature/challenge/board/type/challenge';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challengePeriod';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import React from 'react';

import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
} from '../utils/homeFormatters';

interface HomeRandomChallengesSectionProps {
  challenges: ChallengeListItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  /** 로그인 시 카드가 상세 Link(prefetch)로, 비로그인 시 로그인 유도로 동작 */
  isLoggedIn: boolean;
  onMoreClick(): void;
  onRequireLogin(): void;
}

export default function HomeRandomChallengesSection({
  challenges,
  isLoading,
  isError,
  errorMessage,
  isLoggedIn,
  onMoreClick,
  onRequireLogin,
}: HomeRandomChallengesSectionProps): React.ReactElement {
  const showSkeleton = useMinimumLoading(isLoading);
  return (
    <section className="w-full">
      <SectionHeader
        title="오늘 시작해볼 챌린지"
        subtitle="함께 도전할 친구를 찾아보세요"
        actionLabel="전체보기 →"
        onActionClick={onMoreClick}
        className="[&_h2]:!text-2xl [&_h2]:!tracking-tight"
      />
      {showSkeleton ? (
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
      {!showSkeleton && !isError && challenges.length > 0 ? (
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
            const ended = isChallengeEndedOrArchived(
              challenge.endDate,
              challenge.participantCnt
            );
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
                  isPhotoRequired={challenge.photoRequired}
                  participants={challenge.randomParticipants}
                  href={
                    isLoggedIn
                      ? `/challenge/${challenge.challengeId}`
                      : undefined
                  }
                  onClick={onRequireLogin}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      {!showSkeleton && !isError && challenges.length === 0 ? (
        <EmptyState
          variant="challenge"
          title="표시할 챌린지가 없어요"
          className="py-8"
        />
      ) : null}
    </section>
  );
}
