import { describe, expect, it } from 'vitest';

import type {
  MyChallengeItem,
  MyParticipationStatus,
} from '../type/challenge';
import { getMyChallengeState, sortMyChallenges } from './myChallengeSort';

function make(
  challengeId: number,
  overrides: {
    status?: MyParticipationStatus;
    startDate?: string;
    endDate?: string;
  } = {}
): MyChallengeItem {
  const {
    status = 'PARTICIPANT',
    startDate = '2026-01-01',
    endDate = '2999-12-31', // 기본은 진행중
  } = overrides;

  return {
    participationStatus: status,
    challenge: {
      challengeId,
      title: `챌린지 ${challengeId}`,
      category: 'ETC',
      startDate,
      endDate,
      maxParticipantCnt: 10,
      goalType: 'FIXED',
      participationType: 'GROUP',
      participantCnt: 5,
      likeInfo: { likedByMe: false, likeCnt: 0 },
      challengeType: 'PUBLIC',
    },
  };
}

describe('getMyChallengeState', () => {
  it('LEAVE 는 참여종료(LEFT)', () => {
    expect(getMyChallengeState(make(1, { status: 'LEAVE' }))).toBe('LEFT');
  });

  it('기간 내면 진행중, 기간 지났으면 종료', () => {
    expect(getMyChallengeState(make(1))).toBe('ONGOING');
    expect(
      getMyChallengeState(make(2, { startDate: '2020-01-01', endDate: '2020-02-01' }))
    ).toBe('ENDED');
  });
});

describe('sortMyChallenges', () => {
  it('진행중 → 종료 → 참여종료 순으로 정렬한다', () => {
    const left = make(1, { status: 'LEAVE' });
    const ended = make(2, { startDate: '2020-01-01', endDate: '2020-02-01' });
    const ongoing = make(3);

    const result = sortMyChallenges([left, ended, ongoing]);

    expect(result.map((item) => item.challenge.challengeId)).toEqual([3, 2, 1]);
  });

  it('같은 상태끼리는 날짜(startDate) 최신순', () => {
    const older = make(1, { startDate: '2026-01-01' });
    const newer = make(2, { startDate: '2026-06-01' });

    const result = sortMyChallenges([older, newer]);

    expect(result.map((item) => item.challenge.challengeId)).toEqual([2, 1]);
  });

  it('원본 배열을 변형하지 않는다', () => {
    const input = [make(1), make(2)];
    const copy = [...input];
    sortMyChallenges(input);
    expect(input).toEqual(copy);
  });
});
