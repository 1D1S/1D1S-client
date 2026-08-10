import { describe, expect, it } from 'vitest';

import {
  canWriteDiaryForChallenge,
  getChallengeDayProgress,
  isChallengeEndedOrArchived,
  resolveChallengeCardStatus,
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

describe('getChallengeDayProgress', () => {
  const start = '2026-07-01';
  const end = '2026-07-10'; // 양끝 포함 10일

  it('진행 중이면 오늘까지 진행일과 전체 일수를 낸다', () => {
    const now = new Date('2026-07-03T09:00:00+09:00');
    expect(getChallengeDayProgress(start, end, now)).toEqual({
      currentDay: 3,
      totalDays: 10,
      percent: 30,
    });
  });

  it('종료 후에도 진행일이 전체 일수를 넘지 않는다', () => {
    const now = new Date('2026-08-01T09:00:00+09:00');
    expect(getChallengeDayProgress(start, end, now)).toEqual({
      currentDay: 10,
      totalDays: 10,
      percent: 100,
    });
  });

  it('시작 전이면 진행일 0', () => {
    const now = new Date('2026-06-20T09:00:00+09:00');
    expect(getChallengeDayProgress(start, end, now).currentDay).toBe(0);
  });

  it('무제한이면 전체 일수가 없다', () => {
    const now = new Date('2026-07-05T09:00:00+09:00');
    expect(getChallengeDayProgress(start, '2099-12-31', now)).toEqual({
      currentDay: 5,
      totalDays: null,
      percent: 0,
    });
  });
});

describe('resolveChallengeCardStatus', () => {
  const challenge = {
    startDate: '2026-07-05',
    endDate: '2026-07-10',
    participantCnt: 3,
    challengeType: 'PUBLIC' as const,
  };

  it('시작 전이면 모집중 + 시작까지 남은 일수', () => {
    const now = new Date('2026-07-02T09:00:00+09:00');
    const info = resolveChallengeCardStatus(challenge, now);
    expect(info.status).toBe('UPCOMING');
    expect(info.remainingLabel).toBe('3일 후 시작');
  });

  it('시작일 당일부터 진행중', () => {
    const now = new Date('2026-07-05T09:00:00+09:00');
    expect(resolveChallengeCardStatus(challenge, now).status).toBe('ONGOING');
  });

  it('기간이 지나면 종료', () => {
    const now = new Date('2026-07-12T09:00:00+09:00');
    const info = resolveChallengeCardStatus(challenge, now);
    expect(info.status).toBe('ENDED');
    expect(info.remainingLabel).toBe('종료');
  });
});
