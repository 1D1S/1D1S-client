import { describe, expect, it } from 'vitest';

import { canWriteDiaryForChallenge } from './challengePeriod';

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
