'use client';

import { Card, Icon, Stripe, Text } from '@1d1s/design-system';
import { getCategoryLabel } from '@constants/categories';
import {
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import { ChallengeListItem } from '@feature/challenge/shared/components/ChallengeListItem';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { cn } from '@module/utils/cn';
import { createActivationKeydownHandler } from '@module/utils/event';
import React, { useState } from 'react';

import type { ChallengeListItem as ChallengeListItemType } from '../../../challenge/board/type/challenge';
import { ChallengePicker } from './ChallengePicker';

interface DiaryCreateChallengeSectionProps {
  selectedChallenge: ChallengeListItemType | null;
  isInitialChallengeLoading: boolean;
  isCheckingAvailability: boolean;
  challenges: ChallengeListItemType[];
  isChallengesLoading: boolean;
  onSelectChallenge(challenge: ChallengeListItemType): void;
}

interface EmptyChallengeCardProps {
  onClick(): void;
}

function EmptyChallengeCard({
  onClick,
}: EmptyChallengeCardProps): React.ReactElement {
  return (
    <Card
      interactive
      radius="md"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={createActivationKeydownHandler(onClick)}
      className={cn(
        'flex gap-3 overflow-hidden p-0 sm:gap-4',
        'border-main-400 bg-main-100/40 border-2 border-dashed',
        'hover:border-main-800 hover:bg-main-100/70'
      )}
    >
      <div
        className={cn(
          'bg-main-100 relative h-[104px] w-[104px] shrink-0',
          'overflow-hidden sm:h-[120px] sm:w-[120px]'
        )}
      >
        <Stripe tone="peach" />
        <span
          className={cn(
            'bg-main-200 text-main-800 absolute top-1/2 left-1/2',
            'flex h-10 w-10 -translate-x-1/2 -translate-y-1/2',
            'items-center justify-center rounded-full'
          )}
        >
          <Icon name="Flag" size={20} />
        </span>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col justify-center gap-1.5',
          'py-3 pr-3 sm:py-4 sm:pr-4'
        )}
      >
        <Text
          as="p"
          size="body2"
          weight="extrabold"
          className="text-main-800 truncate sm:text-[17px]"
        >
          챌린지를 선택해주세요
        </Text>
        <Text size="caption2" weight="regular" className="text-gray-500">
          참여 중인 챌린지 중에서 골라보세요.
        </Text>
      </div>
    </Card>
  );
}

export function DiaryCreateChallengeSection({
  selectedChallenge,
  isInitialChallengeLoading,
  isCheckingAvailability,
  challenges,
  isChallengesLoading,
  onSelectChallenge,
}: DiaryCreateChallengeSectionProps): React.ReactElement {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const openPicker = (): void => setIsPickerOpen(true);

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
        <ChallengeListItem
          challengeTitle={selectedChallenge.title}
          challengeType={formatChallengeTypeLabel(selectedChallenge.goalType)}
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
          onClick={openPicker}
        />
      ) : isInitialChallengeLoading ? (
        <div className="rounded-3 border border-gray-200 bg-white px-4 py-3">
          <Text size="body2" weight="regular" className="text-gray-500">
            챌린지 정보를 불러오는 중입니다.
          </Text>
        </div>
      ) : (
        <EmptyChallengeCard onClick={openPicker} />
      )}

      <ChallengePicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        challenges={challenges}
        isLoading={isChallengesLoading}
        onSelect={onSelectChallenge}
      />
    </section>
  );
}
