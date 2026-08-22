import { describe, expect, it } from 'vitest';

import { addDayKey, weekDayFlags } from './chatStatsWeek';

describe('addDayKey', () => {
  it('월요일에서 7일을 센다', () => {
    expect(addDayKey('2026-08-17', 0)).toBe('2026-08-17');
    expect(addDayKey('2026-08-17', 6)).toBe('2026-08-23');
  });

  it('달을 넘겨도 맞는다', () => {
    expect(addDayKey('2026-08-31', 3)).toBe('2026-09-03');
  });

  it('연말을 넘겨도 맞는다', () => {
    expect(addDayKey('2026-12-28', 6)).toBe('2027-01-03');
  });

  it('값이 없으면 빈 문자열 — 어떤 날짜와도 안 맞는다', () => {
    expect(addDayKey('', 0)).toBe('');
    expect(addDayKey('nope', 2)).toBe('');
  });
});

describe('weekDayFlags', () => {
  it('쓴 날만 채운다', () => {
    expect(
      weekDayFlags('2026-08-17', ['2026-08-17', '2026-08-19'])
    ).toEqual([true, false, true, false, false, false, false]);
  });

  it('주 밖 날짜는 무시한다 — 박제된 주만 그린다', () => {
    expect(weekDayFlags('2026-08-17', ['2026-08-10'])).toEqual(
      Array(7).fill(false)
    );
  });

  it('기록이 없으면 전부 빈 점', () => {
    expect(weekDayFlags('2026-08-17', [])).toEqual(Array(7).fill(false));
  });
});
