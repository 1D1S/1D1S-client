'use client';

import { Button } from '@1d1s/design-system';
import ChallengeCard, {
  type ChallengeCardGoalType,
} from '@component/cards/ChallengeCard';
import EmptyState from '@component/EmptyState';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import {
  formatChallengeRemainingLabel,
  isChallengeEndedOrArchived,
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
        <EmptyState
          variant="challenge"
          bordered
          title="진행 중인 챌린지가 없어요"
          className="mt-4"
          action={
            <Button size="sm" onClick={() => router.push('/challenge')}>
              챌린지 찾아보기
            </Button>
          }
        />
      ) : (
        <div
          className={cn(
            '-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 py-2',
            'scrollbar-hide'
          )}
        >
          {challengeList.map((challenge) => {
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
              <div key={challenge.challengeId} className="w-[240px] shrink-0">
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
                  isPhotoRequired={challenge.photoRequired}
                  participants={challenge.randomParticipants}
                  href={`/challenge/${challenge.challengeId}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
