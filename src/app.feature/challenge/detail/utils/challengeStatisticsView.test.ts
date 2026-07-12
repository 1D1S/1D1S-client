import { describe, expect, it } from 'vitest';

import {
  getTrendProgress,
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

describe('getTrendProgress', () => {
  const trend = [
    { date: '2026-07-01', count: 0 },
    { date: '2026-07-02', count: 0 },
    { date: '2026-07-03', count: 0 },
  ];

  it('오늘이 기간 안이면 경과 일수(1-base)를 낸다', () => {
    expect(getTrendProgress(trend, new Date(2026, 6, 2))).toEqual({
      currentDay: 2,
      totalDays: 3,
    });
  });

  it('오늘이 마지막 날 이후면 전 기간 완료로 본다', () => {
    expect(getTrendProgress(trend, new Date(2026, 6, 9))).toEqual({
      currentDay: 3,
      totalDays: 3,
    });
  });

  it('시작 전이면 currentDay 는 0이다', () => {
    expect(getTrendProgress(trend, new Date(2026, 5, 20))).toEqual({
      currentDay: 0,
      totalDays: 3,
    });
  });
});
