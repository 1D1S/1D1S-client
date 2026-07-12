import { describe, expect, it } from 'vitest';

import {
  canWriteDiaryForChallenge,
  isChallengeEndedOrArchived,
} from './challengePeriod';

describe('canWriteDiaryForChallenge', () => {
  const start = '2026-07-01';
  const end = '2026-07-10';

  it('진행 중이면 옵션과 무관하게 작성 가능', () => {
    const now = new Date('2026-07-05T09:00:00+09:00');
    expect(canWriteDiaryForChallenge(start, end, false, now)).toBe(true);
  });

  it('무기한 챌린지는 시작 후 항상 작성 가능', () => {
    const now = new Date('2027-01-01T09:00:00+09:00');
    expect(canWriteDiaryForChallenge(start, '9999-12-31', false, now)).toBe(
      true
    );
  });

  it('종료 + 옵션 OFF: 작성 불가', () => {
    const now = new Date('2026-07-11T09:00:00+09:00');
    expect(canWriteDiaryForChallenge(start, end, false, now)).toBe(false);
  });

  it('종료 + 옵션 ON + 유예(+2일) 이내: 작성 가능', () => {
    const now = new Date('2026-07-12T09:00:00+09:00');
    expect(canWriteDiaryForChallenge(start, end, true, now)).toBe(true);
  });

  it('종료 + 옵션 ON + 유예 경과(+3일): 작성 불가', () => {
    const now = new Date('2026-07-13T09:00:00+09:00');
    expect(canWriteDiaryForChallenge(start, end, true, now)).toBe(false);
  });
});

describe('isChallengeEndedOrArchived', () => {
  const end = '2026-07-10';
  const during = new Date('2026-07-05T09:00:00+09:00');
  const past = new Date('2026-07-12T09:00:00+09:00');

  it('일반 챌린지: 참여자 0명이면 종료(아카이브)로 판정', () => {
    expect(isChallengeEndedOrArchived(end, 0, 'PUBLIC', during)).toBe(true);
  });

  it('공식 챌린지: 참여자 0명이어도 진행 중이면 종료 아님', () => {
    expect(isChallengeEndedOrArchived(end, 0, 'OFFICIAL', during)).toBe(false);
  });

  it('공식 챌린지도 기간이 지나면 종료로 판정', () => {
    expect(isChallengeEndedOrArchived(end, 0, 'OFFICIAL', past)).toBe(true);
  });

  it('challengeType 미지정(undefined): 기존 동작대로 0명이면 종료', () => {
    expect(isChallengeEndedOrArchived(end, 0, undefined, during)).toBe(true);
  });
});
