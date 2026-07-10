import { add, format } from 'date-fns';

import { CreateChallengeRequest } from '../../board/type/challenge';
import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';

const ENDLESS_CHALLENGE_END_DATE = '9999-12-31';

export function resolveChallengeDurationDays(
  values: ChallengeCreateFormValues
): number {
  if (values.periodType !== 'LIMITED') {
    return 0;
  }
  const raw = values.period === 'etc' ? values.periodNumber : values.period;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return 7;
  }
  return Math.max(1, parsed);
}

export function resolveMaxParticipantCnt(
  values: ChallengeCreateFormValues
): number | null {
  if (values.participationType !== 'GROUP') {
    return null;
  }
  if (values.memberCount === 'unlimited') {
    return null;
  }
  const raw =
    values.memberCount === 'etc'
      ? values.memberCountNumber
      : values.memberCount;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formatFormValues(
  values: ChallengeCreateFormValues
): CreateChallengeRequest {
  const safeStartDate = values.startDate ?? new Date();
  const challengeDurationDays = resolveChallengeDurationDays(values);
  const endDate =
    values.periodType === 'ENDLESS'
      ? ENDLESS_CHALLENGE_END_DATE
      : format(
          add(safeStartDate, {
            days: Math.max(0, challengeDurationDays - 1),
          }),
          'yyyy-MM-dd'
        );

  return {
    title: values.title,
    category: values.category,
    description: values.description ?? '',
    startDate: format(safeStartDate, 'yyyy-MM-dd'),
    endDate,
    maxParticipantCnt: resolveMaxParticipantCnt(values),
    goalType: values.goalType,
    participationType: values.participationType,
    goals: values.goals.map((goal) => goal.value),
    allowMidJoin:
      values.participationType === 'INDIVIDUAL' ? false : values.allowMidJoin,
    // 와이어(서버) 키는 photoRequired, 폼 내부 필드명은 isPhotoRequired.
    photoRequired: values.isPhotoRequired,
    thumbnailImage: values.thumbnailImageKey,
    challengeType: values.challengeType,
    // 비공개일 때만 비밀번호를 동봉한다.
    password:
      values.challengeType === 'PRIVATE'
        ? values.password?.trim()
        : undefined,
  };
}
