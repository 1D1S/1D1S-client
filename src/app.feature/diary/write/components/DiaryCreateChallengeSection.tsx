import { Icon, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
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
            'rounded-3 border-main-400 bg-main-100',
            'hover:border-main-800 hover:bg-main-200/60',
            'flex w-full items-center gap-2.5 border-2',
            'px-4 py-4 transition-colors'
          )}
        >
          <span
            className={cn(
              'bg-main-200 text-main-800 flex h-8 w-8 shrink-0 items-center',
              'justify-center rounded-full'
            )}
          >
            <Icon name="Flag" size={16} />
          </span>
          <span
            className={cn(
              'text-main-800 flex-1 truncate text-left',
              'text-sm font-bold'
            )}
          >
            {selectedChallenge.title}
          </span>
          <Icon name="ChevronRight" size={16} className="text-main-800" />
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
