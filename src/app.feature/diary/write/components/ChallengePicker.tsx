'use client';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
  Text,
} from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import { ChallengeListItem } from '@feature/challenge/shared/components/ChallengeListItem';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { cn } from '@module/utils/cn';
import { useState } from 'react';

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

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'rounded-3 border-main-400 bg-main-100/60',
          'hover:border-main-800 hover:bg-main-100',
          'flex w-full items-center gap-2.5 border-2 border-dashed',
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
            'text-main-800 flex-1 truncate text-left text-sm font-bold'
          )}
        >
          챌린지를 선택해주세요
        </span>
        <Icon name="ChevronRight" size={16} className="text-main-800" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>챌린지 선택</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-2.5 pb-2">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <span
                  className={cn(
                    'bg-main-100 h-9 w-9 animate-pulse rounded-full'
                  )}
                />
                <Text size="body2" className="text-gray-500">
                  불러오는 중입니다...
                </Text>
              </div>
            ) : ongoingChallenges.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <span
                  className={cn(
                    'bg-main-100 text-main-800 flex h-10 w-10 items-center',
                    'justify-center rounded-full'
                  )}
                >
                  <Icon name="Flag" size={18} />
                </span>
                <Text size="body2" weight="bold" className="text-gray-700">
                  작성 가능한 진행 중 챌린지가 없어요
                </Text>
                <Text size="caption2" className="text-gray-500">
                  새 챌린지에 참여하거나 모집 중 챌린지를 기다려보세요.
                </Text>
              </div>
            ) : (
              <div className="flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto pr-1">
                {ongoingChallenges.map((challenge) => (
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
                ))}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
