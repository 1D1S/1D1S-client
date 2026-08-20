import { hasHtmlText } from '@module/utils/html';
import { add, format } from 'date-fns';

import { CreateChallengeRequest } from '../../board/type/challenge';
import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';

const ENDLESS_CHALLENGE_END_DATE = '9999-12-31';

/**
 * 일지 양식에 실제로 쓸 내용이 있는가.
 *
 * 리치텍스트 에디터는 아무것도 안 써도 `<p></p>` 같은 빈 껍데기를 낸다.
 * 그대로 보내면 참여자 일지가 빈 양식으로 시작하고, 개요에도 빈 섹션이
 * 뜬다 — 태그를 걷어낸 실제 글자가 있을 때만 양식으로 친다.
 */
export const hasTemplateContent = hasHtmlText;

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
    postEndWriteAllowed: values.postEndWriteAllowed,
    thumbnailImage: values.thumbnailImageKey,
    challengeType: values.challengeType,
    // 비공개일 때만 비밀번호를 동봉한다.
    password:
      values.challengeType === 'PRIVATE'
        ? values.password?.trim()
        : undefined,
    // 빈 에디터는 <p></p> 를 내므로 길이로 판정하지 않는다.
    diaryTemplate: hasTemplateContent(values.diaryTemplate)
      ? values.diaryTemplate
      : undefined,
  };
}
