import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import { type ChallengeListItem } from '@feature/challenge/board/type/challenge';
import { isInfiniteChallengeEndDate } from '@feature/challenge/board/utils/challenge-period';
import { ChallengeCard } from '@feature/challenge/shared/components/challenge-card';
import React from 'react';

import {
  formatChallengeType,
  isChallengeEnded,
  isChallengeOngoing,
} from '../utils/home-formatters';
import HomeSectionHeader from './home-section-header';

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
        title="랜덤 챌린지"
        subtitle="챌린지에 참여하고 목표를 달성해봐요."
        onMoreClick={onMoreClick}
      />
      <div className="h-4" />
      {isLoading ? (
        <div className="flex w-full justify-center px-4 py-8">
          <Text size="body1" weight="medium" className="text-gray-500">
            챌린지를 불러오는 중입니다.
          </Text>
        </div>
      ) : null}
      {isError ? (
        <div className="flex w-full justify-center px-4 py-8">
          <Text size="body1" weight="medium" className="text-red-600">
            {errorMessage ?? '챌린지를 불러오지 못했습니다.'}
          </Text>
        </div>
      ) : null}
      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
          {challenges.map((challenge) => (
            <div key={challenge.challengeId} className="min-w-0">
              <ChallengeCard
                challengeTitle={challenge.title}
                challengeType={formatChallengeType(
                  challenge.challengeType,
                  challenge.maxParticipantCnt
                )}
                challengeCategory={getCategoryLabel(challenge.category)}
                currentUserCount={challenge.participantCnt}
                maxUserCount={challenge.maxParticipantCnt}
                startDate={challenge.startDate}
                endDate={challenge.endDate}
                isInfiniteChallenge={isInfiniteChallengeEndDate(
                  challenge.endDate
                )}
                isOngoing={isChallengeOngoing(
                  challenge.startDate,
                  challenge.endDate
                )}
                isEnded={isChallengeEnded(challenge.endDate)}
                onClick={() => onChallengeClick(challenge.challengeId)}
              />
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && challenges.length === 0 ? (
        <div className="flex w-full justify-center px-4 py-8">
          <Text size="body1" weight="medium" className="text-gray-500">
            표시할 챌린지가 없습니다.
          </Text>
        </div>
      ) : null}
    </>
  );
}
