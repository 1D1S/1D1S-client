'use client';

import { Text } from '@1d1s/design-system';
import ChallengeCard, {
  type ChallengeCardGoalType,
} from '@component/cards/ChallengeCard';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import {
  formatChallengeRemainingLabel,
  isChallengeEnded,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import type { MyPageChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

import { MyPageSectionHeader } from './MyPageSectionHeader';

interface MyPageActiveChallengesProps {
  challengeList: MyPageChallenge[];
}

export function MyPageActiveChallenges({
  challengeList,
}: MyPageActiveChallengesProps): React.ReactElement {
  const router = useRouter();

  return (
    <section>
      <MyPageSectionHeader
        title="진행 중인 챌린지"
        subtitle={`${challengeList.length}개 참여 중`}
      />

      {challengeList.length === 0 ? (
        <div
          className={cn(
            'rounded-3 mt-4 border border-gray-200 p-6 text-center'
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            진행 중인 챌린지가 없습니다.
          </Text>
        </div>
      ) : (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide'
          )}
        >
          {challengeList.map((challenge) => {
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
                className="w-[220px] shrink-0"
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
                  goalType={challenge.goalType as ChallengeCardGoalType}
                  isGroup={challenge.participationType === 'GROUP'}
                  isEnded={ended}
                  participants={challenge.randomParticipants}
                  onClick={() =>
                    router.push(`/challenge/${challenge.challengeId}`)
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
