import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatDateISO,
  formatDateKR,
  formatMonthDayKR,
  getDateTimestamp,
  getRelativeTimeLabel,
  toStartOfDay,
} from './date';

describe('toStartOfDay', () => {
  it('zeroes out the time component', () => {
    const result = toStartOfDay(new Date(2026, 6, 10, 13, 45, 30, 500));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(10);
  });

  it('does not mutate the input date', () => {
    const input = new Date(2026, 6, 10, 13, 45);
    toStartOfDay(input);
    expect(input.getHours()).toBe(13);
  });
});

describe('formatDateISO', () => {
  it('pads month and day to two digits', () => {
    expect(formatDateISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('keeps two-digit month and day as-is', () => {
    expect(formatDateISO(new Date(2026, 11, 25))).toBe('2026-12-25');
  });
});

describe('formatDateKR', () => {
  it('formats month and day in Korean', () => {
    expect(formatDateKR(new Date(2026, 4, 13))).toBe('5월 13일');
  });
});

describe('formatMonthDayKR', () => {
  it('parses an ISO date string without timezone shift', () => {
    expect(formatMonthDayKR('2026-07-06')).toBe('7월 6일');
  });

  it('parses a full ISO timestamp', () => {
    expect(formatMonthDayKR('2026-12-01T09:00:00Z')).toBe('12월 1일');
  });

  it('returns empty string for undefined', () => {
    expect(formatMonthDayKR(undefined)).toBe('');
  });

  it('returns empty string for a malformed value', () => {
    expect(formatMonthDayKR('not-a-date')).toBe('');
  });
});

describe('getDateTimestamp', () => {
  it('returns epoch ms for a date-only string (local midnight)', () => {
    expect(getDateTimestamp('2026-07-10')).toBe(
      new Date(2026, 6, 10).getTime()
    );
  });

  // 백엔드가 내려주는 공백구분 타임스탬프. raw new Date() 는 Safari/Firefox 에서
  // Invalid Date(→NaN) 를 반환하므로, 정규화 파서가 T 로 바꿔 파싱해야 한다.
  it('parses a space-separated datetime (Safari/Firefox safe)', () => {
    expect(getDateTimestamp('2026-07-10 12:00:10')).toBe(
      new Date('2026-07-10T12:00:10').getTime()
    );
  });

  it('returns 0 for an unparseable value', () => {
    expect(getDateTimestamp('nonsense')).toBe(0);
  });

  it('returns 0 for an empty string', () => {
    expect(getDateTimestamp('')).toBe(0);
  });
});

describe('getRelativeTimeLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the fallback for an empty value', () => {
    expect(getRelativeTimeLabel('')).toBe('방금 전');
  });

  it('uses a custom fallback for an empty value', () => {
    expect(getRelativeTimeLabel('', '없음')).toBe('없음');
  });

  it('labels today for a date-only string of the same day', () => {
    expect(getRelativeTimeLabel('2026-07-10')).toBe('오늘');
  });

  it('labels yesterday for a date-only string one day back', () => {
    expect(getRelativeTimeLabel('2026-07-09')).toBe('어제');
  });

  it('labels just now for a sub-30-second timestamp', () => {
    expect(getRelativeTimeLabel('2026-07-10T12:00:10')).toBe('방금 전');
  });

  it('labels minutes ago for a timestamp within the hour', () => {
    expect(getRelativeTimeLabel('2026-07-10T11:30:00')).toBe('30분 전');
  });
});
