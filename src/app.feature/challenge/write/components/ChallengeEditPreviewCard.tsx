import { formatDateKR } from '@module/utils/date';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { isInfiniteChallengeEndDate } from '../../board/utils/challengePeriod';
import { ChallengeEditFormValues } from '../hooks/useChallengeEditForm';
import { ChallengePreviewCardView } from './ChallengePreviewCardView';

interface ChallengeEditPreviewCardProps {
  startDate: string;
  endDate: string;
}

function resolveMemberLabel(values: ChallengeEditFormValues): string {
  if (!values.isGroup) {
    return '나만';
  }
  if (values.memberCount === 'unlimited') {
    return '제한 없음';
  }
  const raw =
    values.memberCount === 'etc'
      ? values.memberCountNumber
      : values.memberCount;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '미설정';
  }
  return `최대 ${parsed}명`;
}

function resolveDurationLabel(startDate: string, endDate: string): string {
  const isEndless = isInfiniteChallengeEndDate(endDate);
  if (isEndless) {
    return '무제한';
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '기간 미설정';
  }
  return `${formatDateKR(start)} – ${formatDateKR(end)}`;
}

export function ChallengeEditPreviewCard({
  startDate,
  endDate,
}: ChallengeEditPreviewCardProps): React.ReactElement {
  const { watch } = useFormContext<ChallengeEditFormValues>();
  const values = watch();

  const filledGoals = (values.goals ?? [])
    .map((goal) => goal.value)
    .filter(Boolean);

  return (
    <ChallengePreviewCardView
      categoryValue={values.category}
      thumbnailPreviewUrl={values.thumbnailPreviewUrl}
      title={values.title}
      description={values.description}
      isGroup={values.isGroup}
      memberLabel={resolveMemberLabel(values)}
      durationLabel={resolveDurationLabel(startDate, endDate)}
      isFlexible={!values.isFixedGoal}
      filledGoals={filledGoals}
    />
  );
}
