import { isChallengeEnded } from '@feature/challenge/board/utils/challengePeriod';
import { describe, expect, it } from 'vitest';

// 공유 피커는 "참여 중인 챌린지" 를 사이드바에서 그대로 받아 쓰고,
// 종료된 것만 걸러 낸다. 그 판정을 여기서 잠근다 — 무기한이 잘못
// 걸러지면 피커가 통째로 비어 보인다.
const NOW = new Date('2026-08-19T12:00:00');

describe('공유 피커 — 진행 중 챌린지만', () => {
  it('종료일이 지난 챌린지는 제외한다', () => {
    expect(isChallengeEnded('2026-08-18', NOW)).toBe(true);
  });

  it('오늘 끝나는 챌린지는 아직 진행 중이다', () => {
    expect(isChallengeEnded('2026-08-19', NOW)).toBe(false);
  });

  it('앞으로 끝나는 챌린지는 진행 중이다', () => {
    expect(isChallengeEnded('2026-12-31', NOW)).toBe(false);
  });

  it('무기한(먼 미래 종료일)은 진행 중으로 본다', () => {
    // 종료일을 아주 먼 해로 두는 것이 무기한 표현이다.
    expect(isChallengeEnded('2999-12-31', NOW)).toBe(false);
  });

  it('종료일이 없으면 거르지 않는다', () => {
    expect(isChallengeEnded(null, NOW)).toBe(false);
    expect(isChallengeEnded(undefined, NOW)).toBe(false);
  });
});
