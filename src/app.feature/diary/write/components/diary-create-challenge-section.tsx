import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challenge-period';
import { ChallengeListItem } from '@feature/challenge/shared/components/challenge-list-item';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challenge-display';
import React from 'react';

import type { ChallengeListItem as ChallengeListItemType } from '../../../challenge/board/type/challenge';
import { ChallengePicker } from './challenge-picker';

interface DiaryCreateChallengeSectionProps {
  selectedChallenge: ChallengeListItemType | null;
  isInitialChallengeLoading: boolean;
  isCheckingAvailability: boolean;
  challenges: ChallengeListItemType[];
  isChallengesLoading: boolean;
  onSelectChallenge(challenge: ChallengeListItemType): void;
  onClearChallenge(): void;
}

export function DiaryCreateChallengeSection({
  selectedChallenge,
  isInitialChallengeLoading,
  isCheckingAvailability,
  challenges,
  isChallengesLoading,
  onSelectChallenge,
  onClearChallenge,
}: DiaryCreateChallengeSectionProps): React.ReactElement {
  return (
    <section>
      <Text size="heading2" weight="bold" className="mb-6 text-gray-900">
        연동된 챌린지
      </Text>

      {isCheckingAvailability ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 정보를 확인하는 중입니다.
          </Text>
        </div>
      ) : selectedChallenge ? (
        <div className="mt-2">
          <ChallengeListItem
            challengeTitle={selectedChallenge.title}
            challengeType={formatChallengeTypeLabel(
              selectedChallenge.challengeType
            )}
            challengeCategory={getCategoryLabel(selectedChallenge.category)}
            imageUrl={selectedChallenge.thumbnailImage}
            currentUserCount={selectedChallenge.participantCnt}
            maxUserCount={selectedChallenge.maxParticipantCnt}
            startDate={selectedChallenge.startDate}
            endDate={selectedChallenge.endDate}
            isInfiniteChallenge={isInfiniteChallengeEndDate(
              selectedChallenge.endDate
            )}
            isOngoing={isChallengeOngoing(
              selectedChallenge.startDate,
              selectedChallenge.endDate
            )}
            isEnded={isChallengeEnded(selectedChallenge.endDate)}
            onClick={onClearChallenge}
          />
        </div>
      ) : isInitialChallengeLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 정보를 불러오는 중입니다.
          </Text>
        </div>
      ) : (
        <ChallengePicker
          challenges={challenges}
          isLoading={isChallengesLoading}
          onSelect={onSelectChallenge}
          className="mt-2"
        />
      )}
    </section>
  );
}
