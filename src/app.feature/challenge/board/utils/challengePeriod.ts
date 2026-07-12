import { toStartOfDay } from '@module/utils/date';
import { add } from 'date-fns';

import type { ChallengeType } from '../type/challenge';

const ENDLESS_MIN_YEAR = 2090;

// 종료 후 일지 작성 유예 기간(일). 서버 규칙과 동일하게 종료일 +2일까지 허용.
export const POST_END_WRITE_GRACE_DAYS = 2;

export function isInfiniteChallengeEndDate(endDate?: string | null): boolean {
  const normalizedEndDate = endDate?.trim();
  if (!normalizedEndDate) {
    return false;
  }

  const parsedEndDate = new Date(normalizedEndDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return false;
  }

  return parsedEndDate.getUTCFullYear() >= ENDLESS_MIN_YEAR;
}

export function isChallengeOngoing(
  startDate?: string | null,
  endDate?: string | null,
  referenceDate: Date = new Date()
): boolean {
  if (!startDate || !endDate) {
    return false;
  }

  const start = toStartOfDay(new Date(startDate));
  const target = toStartOfDay(referenceDate);

  if (Number.isNaN(start.getTime())) {
    return false;
  }

  if (isInfiniteChallengeEndDate(endDate)) {
    return target >= start;
  }

  const end = toStartOfDay(new Date(endDate));
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  return target >= start && target <= end;
}

export function isChallengeEnded(
  endDate?: string | null,
  referenceDate: Date = new Date()
): boolean {
  if (!endDate || isInfiniteChallengeEndDate(endDate)) {
    return false;
  }

  const end = toStartOfDay(new Date(endDate));
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  return toStartOfDay(referenceDate) > end;
}

/**
 * 일지 작성 가능 여부. 서버 규칙과 동일하게 판정한다:
 *   진행 중(무기한 포함) OR (postEndWriteAllowed 이고 종료일 +2일 유예 이내).
 * 챌린지 상세/카드 등 작성 진입 동선 여러 곳에서 재사용한다.
 */
export function canWriteDiaryForChallenge(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  postEndWriteAllowed?: boolean | null,
  referenceDate: Date = new Date()
): boolean {
  if (isChallengeOngoing(startDate, endDate, referenceDate)) {
    return true;
  }
  if (!postEndWriteAllowed || !endDate || isInfiniteChallengeEndDate(endDate)) {
    return false;
  }
  const end = toStartOfDay(new Date(endDate));
  if (Number.isNaN(end.getTime())) {
    return false;
  }
  const target = toStartOfDay(referenceDate);
  const graceEnd = add(end, { days: POST_END_WRITE_GRACE_DAYS });
  return target > end && target <= graceEnd;
}

// 참여자가 0명이면 아카이브된 챌린지로 간주해 종료 처리한다.
// 단, 공식 챌린지(OFFICIAL)는 참여자 0명이어도 아카이브로 보지 않고
// 종료 판정을 기간(endDate) 기준으로만 한다. 운영이 만들어둔 공식 챌린지가
// 아직 참여자가 없다는 이유로 종료로 표시되거나 노출에서 빠지는 걸 막는다.
export function isChallengeEndedOrArchived(
  endDate: string | null | undefined,
  participantCnt: number | null | undefined,
  challengeType?: ChallengeType | null,
  referenceDate: Date = new Date()
): boolean {
  if (isChallengeEnded(endDate, referenceDate)) {
    return true;
  }
  if (challengeType === 'OFFICIAL') {
    return false;
  }
  return (participantCnt ?? 0) === 0;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function formatChallengeRemainingLabel(
  endDate: string,
  isInfinite: boolean,
  isEnded: boolean
): string {
  // 종료(아카이브 포함) 상태가 무제한보다 우선한다.
  if (isEnded) {
    return '종료';
  }
  if (isInfinite) {
    return '무제한';
  }
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) {
    return '';
  }
  const days = Math.max(0, Math.ceil((end - Date.now()) / MS_PER_DAY));
  return `${days}일 남음`;
}
