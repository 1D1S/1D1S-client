'use client';

import { Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import { ChallengeListItem } from '@feature/challenge/shared/components/ChallengeListItem';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { cn } from '@module/utils/cn';
import { useEffect, useState } from 'react';

import type { ChallengeListItem as ChallengeListItemType } from '../../../challenge/board/type/challenge';

interface ChallengePickerProps {
  challenges: ChallengeListItemType[];
  isLoading?: boolean;
  onSelect?(challenge: ChallengeListItemType): void;
  className?: string;
}

export function ChallengePicker({
  challenges,
  isLoading = false,
  onSelect,
  className = '',
}: ChallengePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const ongoingChallenges = challenges.filter((challenge) =>
    isChallengeOngoing(challenge.startDate, challenge.endDate)
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
          className="relative mx-auto max-w-md rounded-xl bg-white p-6 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <Text size="heading1" weight="bold" className="mb-4 block">
            챌린지 선택
          </Text>
          <div className="-mx-1 flex max-h-[60vh] flex-col space-y-2 overflow-y-auto px-1 py-1">
            {isLoading ? (
              <Text size="body1" className="py-4 text-gray-500">
                불러오는 중...
              </Text>
            ) : ongoingChallenges.length === 0 ? (
              <Text size="body1" className="py-4 text-gray-500">
                작성 가능한 진행 중 챌린지가 없습니다.
              </Text>
            ) : (
              ongoingChallenges.map((challenge) => (
                <ChallengeListItem
                  key={challenge.challengeId}
                  challengeTitle={challenge.title}
                  challengeType={formatChallengeTypeLabel(
                    challenge.goalType
                  )}
                  challengeCategory={getCategoryLabel(challenge.category)}
                  imageUrl={challenge.thumbnailImage}
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
                  onClick={() => {
                    onSelect?.(challenge);
                    setIsOpen(false);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
