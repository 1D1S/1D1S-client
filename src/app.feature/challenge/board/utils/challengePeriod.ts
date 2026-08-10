import {
  getInclusiveDayCount,
  MS_PER_DAY,
  parseDateValue,
  toStartOfDay,
} from '@module/utils/date';
import { add } from 'date-fns';

import type { ChallengeStatus, ChallengeType } from '../type/challenge';

const ENDLESS_MIN_YEAR = 2090;

// 날짜 전용 문자열을 로컬 자정으로 파싱한다. `new Date('YYYY-MM-DD')` 는
// UTC 자정으로 해석돼 음수 오프셋 타임존에서 판정이 하루 밀린다.
function parseDayStart(value: string): Date | null {
  const parsed = parseDateValue(value);
  return parsed ? toStartOfDay(parsed) : null;
}

// 종료 후 일지 작성 유예 기간(일). 서버 규칙과 동일하게 종료일 +2일까지 허용.
export const POST_END_WRITE_GRACE_DAYS = 2;

export function isInfiniteChallengeEndDate(endDate?: string | null): boolean {
  const normalizedEndDate = endDate?.trim();
  if (!normalizedEndDate) {
    return false;
  }

  const parsedEndDate = parseDateValue(normalizedEndDate);
  if (!parsedEndDate) {
    return false;
  }

  return parsedEndDate.getFullYear() >= ENDLESS_MIN_YEAR;
}

export function isChallengeOngoing(
  startDate?: string | null,
  endDate?: string | null,
  referenceDate: Date = new Date()
): boolean {
  if (!startDate || !endDate) {
    return false;
  }

  const start = parseDayStart(startDate);
  const target = toStartOfDay(referenceDate);

  if (!start) {
    return false;
  }

  if (isInfiniteChallengeEndDate(endDate)) {
    return target >= start;
  }

  const end = parseDayStart(endDate);
  if (!end) {
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

  const end = parseDayStart(endDate);
  if (!end) {
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
  const end = parseDayStart(endDate);
  if (!end) {
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

// 모집중 챌린지의 시작까지 남은 일수 라벨.
export function formatChallengeStartLabel(
  startDate: string,
  referenceDate: Date = new Date()
): string {
  const start = parseDayStart(startDate);
  if (!start) {
    return '모집 중';
  }
  const today = toStartOfDay(referenceDate).getTime();
  const days = Math.round((start.getTime() - today) / MS_PER_DAY);
  if (days <= 0) {
    return '오늘 시작';
  }
  return `${days}일 후 시작`;
}

export interface ChallengeDayProgress {
  // 오늘까지 진행일(1-base). 시작 전이면 0, 종료 후면 전체 일수.
  currentDay: number;
  // 챌린지 전체 일수. 무제한이면 null.
  totalDays: number | null;
  // 진행률(%) — 진행일 / 전체 일수. 무제한이면 0.
  percent: number;
}

/**
 * 기간 기준 진행 정도. "며칠째 진행 중인지"가 필요한 곳(상세 진행률 바,
 * 통계 진행 KPI)에서 공통으로 쓴다. 참여율(participationRate)과 다르다.
 */
export function getChallengeDayProgress(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  referenceDate: Date = new Date()
): ChallengeDayProgress {
  const start = startDate ? parseDayStart(startDate) : null;
  if (!start) {
    return { currentDay: 0, totalDays: null, percent: 0 };
  }

  const today = toStartOfDay(referenceDate).getTime();
  const elapsed = Math.round((today - start.getTime()) / MS_PER_DAY) + 1;
  const currentDay = Math.max(0, elapsed);

  if (!endDate || isInfiniteChallengeEndDate(endDate)) {
    return { currentDay, totalDays: null, percent: 0 };
  }

  const totalDays = getInclusiveDayCount(startDate, endDate);
  if (totalDays === null || totalDays <= 0) {
    return { currentDay, totalDays: null, percent: 0 };
  }

  const capped = Math.min(currentDay, totalDays);
  return {
    currentDay: capped,
    totalDays,
    percent: Math.round((capped / totalDays) * 1000) / 10,
  };
}

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
  // 달력 일수 기준 — 시각 기반 계산은 마지막 날 오전에 이미 "0일"이 됐다.
  const end = parseDayStart(endDate);
  if (!end) {
    return '';
  }
  const today = toStartOfDay(new Date()).getTime();
  const days = Math.max(0, Math.round((end.getTime() - today) / MS_PER_DAY));
  return `${days}일 남음`;
}

export interface ChallengeCardStatusInfo {
  status: ChallengeStatus;
  isInfinite: boolean;
  isEnded: boolean;
  // 카드 우측 하단 라벨. 모집중이면 시작까지 남은 일수를 보여준다.
  remainingLabel: string;
}

/**
 * 챌린지 카드(보드/내 챌린지/멤버 목록)에서 공통으로 쓰는 상태 판정.
 * 세 화면이 같은 계산을 각자 하고 있어 모집중/진행중 구분이 빠지면 전부
 * 빠졌다 — 한 곳으로 모아 UPCOMING 을 명시적으로 구분한다.
 */
export function resolveChallengeCardStatus(
  challenge: {
    startDate: string;
    endDate: string;
    participantCnt: number;
    challengeType?: ChallengeType | null;
  },
  referenceDate: Date = new Date()
): ChallengeCardStatusInfo {
  const { startDate, endDate, participantCnt, challengeType } = challenge;
  const isInfinite = isInfiniteChallengeEndDate(endDate);
  const isEnded = isChallengeEndedOrArchived(
    endDate,
    participantCnt,
    challengeType,
    referenceDate
  );
  const status: ChallengeStatus = isEnded
    ? 'ENDED'
    : isChallengeOngoing(startDate, endDate, referenceDate)
      ? 'ONGOING'
      : 'UPCOMING';

  return {
    status,
    isInfinite,
    isEnded,
    remainingLabel:
      status === 'UPCOMING'
        ? formatChallengeStartLabel(startDate, referenceDate)
        : formatChallengeRemainingLabel(endDate, isInfinite, isEnded),
  };
}
