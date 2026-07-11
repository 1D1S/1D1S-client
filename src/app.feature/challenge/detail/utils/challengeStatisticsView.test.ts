import { describe, expect, it } from 'vitest';

import { parseLocalDate } from './challengeStatisticsView';

describe('parseLocalDate', () => {
  it('UTC 시프트 없이 로컬 자정으로 파싱한다', () => {
    const date = parseLocalDate('2026-07-11');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6); // 0-based
    expect(date.getDate()).toBe(11);
    expect(date.getHours()).toBe(0);
  });
});
