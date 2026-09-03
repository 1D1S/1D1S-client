'use client';

import { Card, Icon, Stripe, Text } from '@1d1s/design-system';
import {
  CategoryIcon,
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import {
  isChallengeEndedOrArchived,
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
        'flex items-center gap-3 overflow-hidden rounded-[14px] p-3',
        'sm:gap-4 sm:p-4',
        'border-main-300 bg-main-100/20 border',
        'hover:border-main-500 hover:bg-main-100/35'
      )}
    >
      <div
        className={cn(
          'bg-main-100 relative aspect-video w-[126px] shrink-0',
          'overflow-hidden rounded-[10px] sm:w-[154px]'
        )}
      >
        <Stripe tone="peach" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Text
            as="p"
            size="body2"
            weight="extrabold"
            className="text-main-900 truncate sm:text-[17px]"
          >
            챌린지를 선택해주세요
          </Text>
          <Text size="caption2" weight="regular" className="text-main-700">
            참여 중인 챌린지 중에서 골라보세요.
          </Text>
        </div>

        <span className="text-main-800 inline-flex items-center gap-1">
          <Text size="caption2" weight="bold" className="text-main-800">
            챌린지 선택하기
          </Text>
          <Icon name="ChevronRight" size={13} className="text-main-800" />
        </span>
      </div>
    </Card>
  );
}

function DiaryCreateChallengeSectionComponent({
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
          categoryIcon={
            <CategoryIcon category={selectedChallenge.category} />
          }
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
          isEnded={isChallengeEndedOrArchived(
            selectedChallenge.endDate,
            selectedChallenge.participantCnt,
            selectedChallenge.challengeType
          )}
          stripeTone={getCategoryStripeTone(selectedChallenge.category)}
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

export const DiaryCreateChallengeSection = React.memo(
  DiaryCreateChallengeSectionComponent
);
