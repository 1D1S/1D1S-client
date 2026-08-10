import { describe, expect, it } from 'vitest';

import {
  parseLocalDate,
  summarizeDiaryTrend,
} from './challengeStatisticsView';

describe('parseLocalDate', () => {
  it('UTC 시프트 없이 로컬 자정으로 파싱한다', () => {
    const date = parseLocalDate('2026-07-11');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6); // 0-based
    expect(date.getDate()).toBe(11);
    expect(date.getHours()).toBe(0);
  });
});

describe('summarizeDiaryTrend', () => {
  it('합계·최댓값·피크 인덱스를 계산한다', () => {
    const summary = summarizeDiaryTrend([
      { date: '2026-07-01', count: 1 },
      { date: '2026-07-02', count: 4 },
      { date: '2026-07-03', count: 2 },
    ]);
    expect(summary.total).toBe(7);
    expect(summary.max).toBe(4);
    expect(summary.peakIndex).toBe(1);
  });

  it('전부 0개면 피크가 없고 max 는 1로 보정한다', () => {
    const summary = summarizeDiaryTrend([
      { date: '2026-07-01', count: 0 },
      { date: '2026-07-02', count: 0 },
    ]);
    expect(summary.total).toBe(0);
    expect(summary.max).toBe(1);
    expect(summary.peakIndex).toBe(-1);
  });

  it('빈 배열도 안전하게 처리한다', () => {
    expect(summarizeDiaryTrend([])).toEqual({
      total: 0,
      max: 1,
      peakIndex: -1,
    });
  });
});
