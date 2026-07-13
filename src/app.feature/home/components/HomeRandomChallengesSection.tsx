import { Icon, SectionHeader, Text } from '@1d1s/design-system';
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
  onMoreClick(): void;
  // 아래는 탐색(/explore)에서 공식 챌린지 섹션으로 재사용하기 위한 표시 옵션.
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  // 공식 챌린지 섹션 — 제목 앞에 1D1S 로고를 붙여 공식 표기를 명확히 한다.
  official?: boolean;
}

export default function HomeRandomChallengesSection({
  challenges,
  isLoading,
  isError,
  errorMessage,
  onMoreClick,
  title = '오늘 시작해볼 챌린지',
  subtitle = '함께 도전할 친구를 찾아보세요',
  emptyTitle = '표시할 챌린지가 없어요',
  official = false,
}: HomeRandomChallengesSectionProps): React.ReactElement {
  const showSkeleton = useMinimumLoading(isLoading);
  const titleNode = official ? (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          'rounded-2 flex h-7 w-7 items-center justify-center',
          'from-main-700 to-main-800 bg-gradient-to-br',
          'shadow-warm text-white'
        )}
      >
        <Icon name="Logo" size={16} className="text-white" />
      </span>
      {title}
    </span>
  ) : (
    title
  );
  return (
    <section className="w-full">
      <SectionHeader
        title={titleNode}
        subtitle={subtitle}
        actionLabel="전체보기 →"
        onActionClick={onMoreClick}
        className="[&_h2]:!text-2xl [&_h2]:!tracking-tight"
      />
      {showSkeleton ? (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pt-2 pb-6',
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
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pt-2 pb-6',
            'scrollbar-hide data-fade-in',
            'sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0',
            'sm:py-0 lg:grid-cols-4'
          )}
        >
          {challenges.map((challenge) => {
            const isInfinite = isInfiniteChallengeEndDate(challenge.endDate);
            const ended = isChallengeEndedOrArchived(
              challenge.endDate,
              challenge.participantCnt,
              challenge.challengeType
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
                  isOfficial={challenge.challengeType === 'OFFICIAL'}
                  isEnded={ended}
                  isPhotoRequired={challenge.photoRequired}
                  participants={challenge.randomParticipants}
                  href={`/challenge/${challenge.challengeId}`}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      {!showSkeleton && !isError && challenges.length === 0 ? (
        <EmptyState variant="challenge" title={emptyTitle} className="py-8" />
      ) : null}
    </section>
  );
}
