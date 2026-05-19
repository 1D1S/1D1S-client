import { formatDateISO } from '@module/utils/date';

import type {
  ChallengeGoal,
  Participant,
  ParticipantStatus,
} from '../../board/type/challenge';
import { isInfiniteChallengeEndDate } from '../../board/utils/challengePeriod';

export const PARTICIPATING_STATUS: ParticipantStatus[] = [
  'HOST',
  'PARTICIPANT',
  'ACCEPTED',
];
export const EMPTY_GOALS: ChallengeGoal[] = [];
export const EMPTY_PARTICIPANTS: Participant[] = [];
export const ENDLESS_LABEL = '무한!';

export function formatDateRange(startDate: string, endDate: string): string {
  const format = (date: string): string => date.replaceAll('-', '.');
  if (isInfiniteChallengeEndDate(endDate)) {
    return `${format(startDate)} ~ ${ENDLESS_LABEL}`;
  }

  return `${format(startDate)} ~ ${format(endDate)}`;
}

export function getDdayLabel(endDate: string): string {
  if (isInfiniteChallengeEndDate(endDate)) {
    return ENDLESS_LABEL;
  }

  const today = new Date();
  const end = new Date(endDate);
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const dayDiff = Math.ceil((end.getTime() - today.getTime()) / 86400000);

  if (dayDiff > 0) {
    return `D-${dayDiff}`;
  }
  if (dayDiff === 0) {
    return 'D-DAY';
  }
  return `D+${Math.abs(dayDiff)}`;
}

export function getRemainingLabel(endDate: string): string {
  const ddayLabel = getDdayLabel(endDate);
  if (ddayLabel === ENDLESS_LABEL) {
    return '마감 없음';
  }
  if (ddayLabel === 'D-DAY') {
    return '오늘 마감';
  }
  if (ddayLabel.startsWith('D-')) {
    return `${ddayLabel.slice(2)}일 남음`;
  }
  return '챌린지 종료';
}

export function hasSelectableDiaryDate(disabledDateKeys: string[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset <= 2; dayOffset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() - dayOffset);

    if (!disabledDateKeys.includes(formatDateISO(candidate))) {
      return true;
    }
  }

  return false;
}

export function formatRelativeJoinedText(status: ParticipantStatus): string {
  switch (status) {
    case 'PENDING':
      return '참여 승인 대기 중';
    case 'REJECTED':
      return '신청 거절됨';
    default:
      return '참여 중';
  }
}
