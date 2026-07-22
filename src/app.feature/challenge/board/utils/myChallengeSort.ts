import type { MyPageChallenge } from '@feature/member/type/member';
import { getDateTimestamp } from '@module/utils/date';

import { isChallengeEndedOrArchived } from './challengePeriod';

// 내 챌린지 정렬 기준 날짜 — 한 곳에 모은다(요구사항: 정렬 기준을 한 곳에).
//
// ⚠️ 현재 my-page 응답(MyPageChallenge)에는 "참여일(joinedAt)"·"생성일
// (createdAt)" 필드가 없다. 있는 날짜 필드는 startDate/endDate 뿐이라, 우선
// startDate 최신순을 기준으로 둔다. 서버가 참여일/생성일을 응답에 추가하면
// 이 accessor 한 곳만 교체하면 된다.
export function getMyChallengeSortDate(challenge: MyPageChallenge): number {
  return getDateTimestamp(challenge.startDate);
}

/**
 * 내 챌린지 정렬 — 진행중 우선, 그다음 날짜(최신순).
 * 진행중 판정은 endDate/참여자수 기준(isChallengeEndedOrArchived).
 * 현재 서버는 진행중만 내려주지만, 종료·과거참여가 응답에 포함되면 이 정렬이
 * 그대로 "진행중 먼저, 종료 나중"으로 동작한다.
 */
export function sortMyChallenges(
  challenges: MyPageChallenge[]
): MyPageChallenge[] {
  return [...challenges].sort((left, right) => {
    const leftEnded = isChallengeEndedOrArchived(
      left.endDate,
      left.participantCnt
    );
    const rightEnded = isChallengeEndedOrArchived(
      right.endDate,
      right.participantCnt
    );
    if (leftEnded !== rightEnded) {
      return leftEnded ? 1 : -1; // 진행중(false) 이 앞으로
    }
    return getMyChallengeSortDate(right) - getMyChallengeSortDate(left);
  });
}
