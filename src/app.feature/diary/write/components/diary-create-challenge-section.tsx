import { Text } from '@1d1s/design-system';
import { ChevronRight, Flame } from 'lucide-react';
import React from 'react';

import type { ChallengeListItem } from '../../../challenge/board/type/challenge';
import { ChallengePicker } from './challenge-picker';

interface DiaryCreateChallengeSectionProps {
  selectedChallenge: ChallengeListItem | null;
  isInitialChallengeLoading: boolean;
  challenges: ChallengeListItem[];
  isChallengesLoading: boolean;
  onSelectChallenge(challenge: ChallengeListItem): void;
  onClearChallenge(): void;
}

export function DiaryCreateChallengeSection({
  selectedChallenge,
  isInitialChallengeLoading,
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

      {selectedChallenge ? (
        <div className="mt-2 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="bg-main-200 text-main-800 flex h-14 w-14 items-center justify-center rounded-xl">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <Text size="heading1" weight="bold" className="text-gray-900">
                {selectedChallenge.title}
              </Text>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-caption1 rounded-lg bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                  {selectedChallenge.category}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-gray-600 transition hover:text-gray-800"
            onClick={onClearChallenge}
          >
            <Text size="body2" weight="medium">
              변경
            </Text>
            <ChevronRight className="h-4 w-4" />
          </button>
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
