import { describe, expect, it } from 'vitest';

import { ChallengeCreateFormValues } from '../hooks/useChallengeCreateForm';
import {
  formatFormValues,
  resolveChallengeDurationDays,
  resolveMaxParticipantCnt,
} from './challengeCreatePayload';

function makeValues(
  overrides: Partial<ChallengeCreateFormValues> = {}
): ChallengeCreateFormValues {
  return {
    title: '테스트 챌린지',
    category: 'DEV',
    description: '설명',
    periodType: 'ENDLESS',
    participationType: 'INDIVIDUAL',
    goalType: 'FIXED',
    allowMidJoin: true,
    isPhotoRequired: false,
    challengeType: 'PUBLIC',
    startDate: new Date(2026, 6, 10),
    goals: [{ value: '매일 커밋' }],
    ...overrides,
  };
}

describe('resolveChallengeDurationDays', () => {
  it('returns 0 for a non-LIMITED period', () => {
    expect(resolveChallengeDurationDays(makeValues())).toBe(0);
  });

  it('returns the preset period as a number', () => {
    const values = makeValues({ periodType: 'LIMITED', period: '30' });
    expect(resolveChallengeDurationDays(values)).toBe(30);
  });

  it('uses periodNumber when period is etc', () => {
    const values = makeValues({
      periodType: 'LIMITED',
      period: 'etc',
      periodNumber: '45',
    });
    expect(resolveChallengeDurationDays(values)).toBe(45);
  });

  it('falls back to 7 when the etc number is missing', () => {
    const values = makeValues({ periodType: 'LIMITED', period: 'etc' });
    expect(resolveChallengeDurationDays(values)).toBe(7);
  });

  it('clamps to a minimum of 1', () => {
    const values = makeValues({
      periodType: 'LIMITED',
      period: 'etc',
      periodNumber: '0',
    });
    expect(resolveChallengeDurationDays(values)).toBe(1);
  });
});

describe('resolveMaxParticipantCnt', () => {
  it('returns null for an individual challenge', () => {
    expect(resolveMaxParticipantCnt(makeValues())).toBeNull();
  });

  it('returns null for an unlimited group', () => {
    const values = makeValues({
      participationType: 'GROUP',
      memberCount: 'unlimited',
    });
    expect(resolveMaxParticipantCnt(values)).toBeNull();
  });

  it('returns the preset member count', () => {
    const values = makeValues({
      participationType: 'GROUP',
      memberCount: '10',
    });
    expect(resolveMaxParticipantCnt(values)).toBe(10);
  });

  it('uses memberCountNumber when member count is etc', () => {
    const values = makeValues({
      participationType: 'GROUP',
      memberCount: 'etc',
      memberCountNumber: '7',
    });
    expect(resolveMaxParticipantCnt(values)).toBe(7);
  });

  it('returns null for a non-positive custom count', () => {
    const values = makeValues({
      participationType: 'GROUP',
      memberCount: 'etc',
      memberCountNumber: '0',
    });
    expect(resolveMaxParticipantCnt(values)).toBeNull();
  });
});

describe('formatFormValues', () => {
  it('builds an endless individual payload', () => {
    const payload = formatFormValues(makeValues());
    expect(payload).toMatchObject({
      title: '테스트 챌린지',
      category: 'DEV',
      description: '설명',
      startDate: '2026-07-10',
      endDate: '9999-12-31',
      maxParticipantCnt: null,
      goalType: 'FIXED',
      participationType: 'INDIVIDUAL',
      goals: ['매일 커밋'],
      photoRequired: false,
      challengeType: 'PUBLIC',
    });
  });

  it('forces allowMidJoin to false for an individual challenge', () => {
    const payload = formatFormValues(makeValues({ allowMidJoin: true }));
    expect(payload.allowMidJoin).toBe(false);
  });

  it('keeps allowMidJoin for a group challenge', () => {
    const values = makeValues({
      participationType: 'GROUP',
      memberCount: '5',
      allowMidJoin: true,
    });
    expect(formatFormValues(values).allowMidJoin).toBe(true);
  });

  it('computes the end date as start + (duration - 1) days', () => {
    const values = makeValues({ periodType: 'LIMITED', period: '7' });
    expect(formatFormValues(values).endDate).toBe('2026-07-16');
  });

  it('omits the password for a public challenge', () => {
    const payload = formatFormValues(makeValues({ password: 'secret' }));
    expect(payload.password).toBeUndefined();
  });

  it('trims the password for a private challenge', () => {
    const values = makeValues({
      challengeType: 'PRIVATE',
      password: '  secret  ',
    });
    expect(formatFormValues(values).password).toBe('secret');
  });

  it('defaults an empty description to an empty string', () => {
    const payload = formatFormValues(makeValues({ description: undefined }));
    expect(payload.description).toBe('');
  });
});
