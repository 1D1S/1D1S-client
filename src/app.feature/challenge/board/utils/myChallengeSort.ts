import { getDateTimestamp } from '@module/utils/date';

import type { MyChallengeItem } from '../type/challenge';
import { isChallengeOngoing } from './challengePeriod';

// 내 챌린지 화면 상태 — 진행중 / 종료 / 참여종료(LEAVE).
export type MyChallengeState = 'ONGOING' | 'ENDED' | 'LEFT';

/**
 * 항목의 화면 상태 판정. 서버 isOngoingParticipation 과 같은 규칙:
 * LEAVE 는 과거참여, 그 외는 오늘이 게시기간 내면 진행중, 아니면 종료.
 */
export function getMyChallengeState(item: MyChallengeItem): MyChallengeState {
  if (item.participationStatus === 'LEAVE') {
    return 'LEFT';
  }
  return isChallengeOngoing(item.challenge.startDate, item.challenge.endDate)
    ? 'ONGOING'
    : 'ENDED';
}

// 정렬 기준 날짜 — 한 곳에 모은다.
//
// ⚠️ 응답에 "참여일(joinedAt)"·"생성일(createdAt)" 이 아직 없다. 있는 날짜는
// challenge.startDate/endDate 뿐이라 startDate 최신순을 기준으로 둔다.
// 서버가 참여일을 추가하면 이 accessor 한 곳만 교체하면 된다.
export function getMyChallengeSortDate(item: MyChallengeItem): number {
  return getDateTimestamp(item.challenge.startDate);
}

// 진행중 → 종료 → 참여종료 순.
const STATE_RANK: Record<MyChallengeState, number> = {
  ONGOING: 0,
  ENDED: 1,
  LEFT: 2,
};

/**
 * 내 챌린지 정렬 — 진행중 우선, 그다음 날짜(최신순).
 * 검색·필터로 좁힌 결과에 그대로 적용한다.
 */
export function sortMyChallenges(
  items: MyChallengeItem[]
): MyChallengeItem[] {
  return [...items].sort((left, right) => {
    const rankDiff =
      STATE_RANK[getMyChallengeState(left)] -
      STATE_RANK[getMyChallengeState(right)];
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return getMyChallengeSortDate(right) - getMyChallengeSortDate(left);
  });
}
