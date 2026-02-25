'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useEffect, useState } from 'react';

import { useMemberChallenges } from '../../../challenge/board/hooks/use-challenge-queries';
import type { ChallengeListItem } from '../../../challenge/board/type/challenge';

interface ChallengePickerProps {
  onSelect?(challenge: ChallengeListItem): void;
  className?: string;
}

export function ChallengePicker({
  onSelect,
  className = '',
}: ChallengePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: 실제 로그인된 사용자의 memberId로 교체
  const { data: challenges = [], isLoading } = useMemberChallenges({
    memberId: 1,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOverlayClick = (): void => setIsOpen(false);

  return (
    <div className={className}>
      <div
        className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition hover:border-gray-400"
        onClick={() => setIsOpen(true)}
      >
        <Text className="text-gray-500">챌린지를 선택해주세요.</Text>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'transition-opacity duration-300 ease-in-out',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        aria-modal="true"
        role="dialog"
        onClick={handleOverlayClick}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div
          className="relative mx-auto max-w-md rounded-xl bg-white p-6 text-center shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <Text size="heading1" weight="bold" className="mb-4 block">
            챌린지 선택
          </Text>
          <div className="flex max-h-[60vh] flex-col space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <Text size="body1" className="py-4 text-gray-500">
                불러오는 중...
              </Text>
            ) : challenges.length === 0 ? (
              <Text size="body1" className="py-4 text-gray-500">
                참여 중인 챌린지가 없습니다.
              </Text>
            ) : (
              challenges.map((challenge) => (
                <button
                  key={challenge.challengeId}
                  type="button"
                  className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:bg-gray-50"
                  onClick={() => {
                    onSelect?.(challenge);
                    setIsOpen(false);
                  }}
                >
                  <Text size="body1" weight="bold" className="text-black">
                    {challenge.title}
                  </Text>
                  <Text
                    size="caption2"
                    weight="regular"
                    className="text-gray-600"
                  >
                    {challenge.startDate} - {challenge.endDate}
                  </Text>
                  <Text
                    size="caption2"
                    weight="regular"
                    className="text-gray-600"
                  >
                    {challenge.participantCnt}/{challenge.maxParticipantCnt}
                  </Text>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
