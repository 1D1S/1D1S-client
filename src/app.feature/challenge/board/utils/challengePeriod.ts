import { toStartOfDay } from '@module/utils/date';

const ENDLESS_MIN_YEAR = 2090;

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

// 참여자가 0명이면 아카이브된 챌린지로 간주해 종료 처리한다.
export function isChallengeEndedOrArchived(
  endDate: string | null | undefined,
  participantCnt: number | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  return (
    isChallengeEnded(endDate, referenceDate) || (participantCnt ?? 0) === 0
  );
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
