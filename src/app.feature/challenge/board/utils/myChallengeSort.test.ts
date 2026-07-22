import type { MyPageChallenge } from '@feature/member/type/member';
import { describe, expect, it } from 'vitest';

import { sortMyChallenges } from './myChallengeSort';

function make(overrides: Partial<MyPageChallenge>): MyPageChallenge {
  return {
    challengeId: 1,
    title: '챌린지',
    category: 'ETC',
    startDate: '2026-01-01',
    endDate: '2999-12-31', // 기본은 진행중
    maxParticipantCnt: 10,
    goalType: 'FIXED',
    participationType: 'GROUP',
    participantCnt: 5,
    likeInfo: { likedByMe: false, likeCnt: 0 },
    ...overrides,
  };
}

describe('sortMyChallenges', () => {
  it('진행중을 종료보다 앞에 둔다', () => {
    const ended = make({ challengeId: 1, endDate: '2020-01-01' });
    const ongoing = make({ challengeId: 2, endDate: '2999-12-31' });

    const result = sortMyChallenges([ended, ongoing]);

    expect(result.map((c) => c.challengeId)).toEqual([2, 1]);
  });

  it('같은 진행 상태끼리는 날짜(startDate) 최신순', () => {
    const older = make({ challengeId: 1, startDate: '2026-01-01' });
    const newer = make({ challengeId: 2, startDate: '2026-06-01' });

    const result = sortMyChallenges([older, newer]);

    expect(result.map((c) => c.challengeId)).toEqual([2, 1]);
  });

  it('원본 배열을 변형하지 않는다', () => {
    const input = [make({ challengeId: 1 }), make({ challengeId: 2 })];
    const copy = [...input];
    sortMyChallenges(input);
    expect(input).toEqual(copy);
  });
});
