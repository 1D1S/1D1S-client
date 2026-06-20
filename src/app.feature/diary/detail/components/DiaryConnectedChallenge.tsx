import { Text } from '@1d1s/design-system';
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
import { Flag } from 'lucide-react';
import React from 'react';

import type { ChallengeSummary } from '../../../challenge/board/type/challenge';

export function DiaryConnectedChallengeCard({
  summary,
  onClick,
}: {
  summary: ChallengeSummary;
  onClick(): void;
}): React.ReactElement {
  return (
    <ChallengeListItem
      challengeTitle={summary.title}
      challengeType={formatChallengeTypeLabel(summary.goalType)}
      challengeCategory={getCategoryLabel(summary.category)}
      categoryIcon={<CategoryIcon category={summary.category} />}
      imageUrl={summary.thumbnailImage ?? undefined}
      currentUserCount={summary.participantCnt}
      maxUserCount={summary.maxParticipantCnt}
      startDate={summary.startDate}
      endDate={summary.endDate}
      isInfiniteChallenge={isInfiniteChallengeEndDate(summary.endDate)}
      isOngoing={isChallengeOngoing(summary.startDate, summary.endDate)}
      isEnded={isChallengeEndedOrArchived(
        summary.endDate,
        summary.participantCnt
      )}
      stripeTone={getCategoryStripeTone(summary.category)}
      onClick={onClick}
    />
  );
}

export function DiaryConnectedChallengeFallback({
  title,
}: {
  title: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[14px] border border-dashed',
        'border-gray-200 bg-gray-50 px-3.5 py-3 text-gray-500'
      )}
    >
      <Flag className="h-3.5 w-3.5" />
      <Text size="caption1" weight="medium" className="text-gray-500">
        {title}
      </Text>
    </div>
  );
}
