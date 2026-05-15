import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronRight, Flag } from 'lucide-react';
import React from 'react';

import type { ChallengeListItem as ChallengeListItemType } from '../../../challenge/board/type/challenge';
import { ChallengePicker } from './ChallengePicker';

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
      <Text size="caption1" weight="bold" className="mb-2 block text-gray-600">
        챌린지 선택
      </Text>

      {isCheckingAvailability ? (
        <div className="rounded-3 border border-gray-200 bg-white px-4 py-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 정보를 확인하는 중입니다.
          </Text>
        </div>
      ) : selectedChallenge ? (
        <button
          type="button"
          onClick={onClearChallenge}
          className={cn(
            'rounded-3 border-main-200 bg-main-100',
            'hover:bg-main-200/60 flex w-full items-center gap-2.5',
            'border px-4 py-3 transition-colors'
          )}
        >
          <Flag className="text-main-800 h-4 w-4 shrink-0" />
          <span
            className={cn(
              'text-main-800 flex-1 truncate text-left',
              'text-sm font-bold'
            )}
          >
            {selectedChallenge.title}
          </span>
          <ChevronRight className="text-main-800 h-4 w-4 shrink-0" />
        </button>
      ) : isInitialChallengeLoading ? (
        <div className="rounded-3 border border-gray-200 bg-white px-4 py-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 정보를 불러오는 중입니다.
          </Text>
        </div>
      ) : (
        <ChallengePicker
          challenges={challenges}
          isLoading={isChallengesLoading}
          onSelect={onSelectChallenge}
        />
      )}
    </section>
  );
}
