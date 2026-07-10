import { formatDateKR } from '@module/utils/date';
import { add } from 'date-fns';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import { ChallengePreviewCardView } from './ChallengePreviewCardView';

function resolveDays(values: ChallengeCreateFormValues): number {
  if (values.periodType !== 'LIMITED') {
    return 0;
  }
  const raw = values.period === 'etc' ? values.periodNumber : values.period;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function resolveDurationLabel(values: ChallengeCreateFormValues): string {
  if (values.periodType === 'ENDLESS') {
    if (!values.startDate) {
      return '무제한';
    }
    return `${formatDateKR(values.startDate)} 시작 · 무제한`;
  }
  const days = resolveDays(values);
  if (!values.startDate || days <= 0) {
    return days > 0 ? `${days}일` : '기간 미설정';
  }
  const end = add(values.startDate, { days: Math.max(0, days - 1) });
  return `${formatDateKR(values.startDate)} – ${formatDateKR(end)} · ${days}일`;
}

function resolveMemberLabel(values: ChallengeCreateFormValues): string {
  if (values.participationType === 'INDIVIDUAL') {
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

export function ChallengeCreatePreviewCard(): React.ReactElement {
  const { watch } = useFormContext<ChallengeCreateFormValues>();
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
      isGroup={values.participationType === 'GROUP'}
      memberLabel={resolveMemberLabel(values)}
      durationLabel={resolveDurationLabel(values)}
      isFlexible={values.goalType === 'FLEXIBLE'}
      filledGoals={filledGoals}
    />
  );
}
