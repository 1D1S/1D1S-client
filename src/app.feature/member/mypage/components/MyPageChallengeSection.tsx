'use client';

import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import {
  ChallengeCard as DSChallengeCard,
} from '@feature/challenge/shared/components/ChallengeCard';
import {
  formatChallengeCardTypeLabel,
} from '@feature/challenge/shared/utils/challengeDisplay';
import type { MyPageChallenge } from '@feature/member/type/member';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

interface MyPageChallengeSectionProps {
  challengeList: MyPageChallenge[];
}

export function MyPageChallengeSection({
  challengeList,
}: MyPageChallengeSectionProps): React.ReactElement {
  const router = useRouter();

  return (
    <section>
      <Text size="display2" weight="bold" className="text-gray-900">
        진행 중인 챌린지
      </Text>

      {challengeList.length === 0 ? (
        <div
          className={cn(
            'rounded-3 mt-4 border border-gray-200 p-6 text-center',
          )}
        >
          <Text size="body1" weight="medium" className="text-gray-500">
            진행 중인 챌린지가 없습니다.
          </Text>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="flex w-max gap-3 py-2">
            {challengeList.map((ch) => {
              const now = new Date();
              const start = new Date(ch.startDate);
              const end = new Date(ch.endDate);

              return (
                <div
                  key={ch.challengeId}
                  className="w-[320px] shrink-0"
                >
                  <DSChallengeCard
                    challengeTitle={ch.title}
                    challengeType={formatChallengeCardTypeLabel(
                      ch.goalType,
                      ch.maxParticipantCnt
                    )}
                    challengeCategory={getCategoryLabel(ch.category)}
                    imageUrl={ch.thumbnailImage}
                    currentUserCount={ch.participantCnt}
                    maxUserCount={ch.maxParticipantCnt}
                    startDate={ch.startDate}
                    endDate={ch.endDate}
                    isInfiniteChallenge={isInfiniteChallengeEndDate(
                      ch.endDate
                    )}
                    isOngoing={now >= start && now <= end}
                    isEnded={now > end}
                    onClick={() =>
                      router.push(`/challenge/${ch.challengeId}`)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
