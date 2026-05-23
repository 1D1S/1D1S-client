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
import {
  getCategoryLabel,
  getCategoryStripeTone,
} from '@constants/categories';
import {
  isChallengeEnded,
  isChallengeOngoing,
  isInfiniteChallengeEndDate,
} from '@feature/challenge/board/utils/challengePeriod';
import { ChallengeListItem } from '@feature/challenge/shared/components/ChallengeListItem';
import { formatChallengeTypeLabel } from '@feature/challenge/shared/utils/challengeDisplay';
import { cn } from '@module/utils/cn';

import type { ChallengeListItem as ChallengeListItemType } from '../../../challenge/board/type/challenge';

interface ChallengePickerProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  challenges: ChallengeListItemType[];
  isLoading?: boolean;
  onSelect?(challenge: ChallengeListItemType): void;
}

export function ChallengePicker({
  open,
  onOpenChange,
  challenges,
  isLoading = false,
  onSelect,
}: ChallengePickerProps): React.ReactElement {
  const ongoingChallenges = challenges.filter((challenge) =>
    isChallengeOngoing(challenge.startDate, challenge.endDate)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="max-h-[85dvh]">
        <DialogHeader>
          <DialogTitle>챌린지 선택</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex min-h-0 flex-1 flex-col">
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
            <div
              className={cn(
                'flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1'
              )}
            >
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
                  stripeTone={getCategoryStripeTone(challenge.category)}
                  variant="picker"
                  onClick={() => {
                    onSelect?.(challenge);
                    onOpenChange(false);
                  }}
                />
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
