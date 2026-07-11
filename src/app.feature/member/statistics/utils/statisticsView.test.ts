import { describe, expect, it } from 'vitest';

import { computeTrendPoints } from './statisticsView';

describe('computeTrendPoints', () => {
  it('spaces points evenly across the width', () => {
    const points = computeTrendPoints([1, 1, 1], 1);
    expect(points.map((p) => p.xPct)).toEqual([0, 50, 100]);
  });

  it('centers a single point', () => {
    expect(computeTrendPoints([5], 5)).toEqual([{ xPct: 50, yPct: 16 }]);
  });

  it('maps the max count to the top of the band', () => {
    // topPad=16, band=72 → 비율 1 이면 상단(16), 비율 0 이면 바닥(88).
    const [low, high] = computeTrendPoints([0, 10], 10);
    expect(high.yPct).toBe(16);
    expect(low.yPct).toBe(88);
    // 절반 값은 밴드 중앙.
    expect(computeTrendPoints([5], 10)[0].yPct).toBe(52);
  });

  it('flattens all-zero data to the baseline without dividing by zero', () => {
    const points = computeTrendPoints([0, 0, 0], 0);
    expect(points.every((p) => p.yPct === 88)).toBe(true);
  });

  it('clamps negative counts to the baseline', () => {
    expect(computeTrendPoints([-5], 10)[0].yPct).toBe(88);
  });

  it('returns an empty array for no data', () => {
    expect(computeTrendPoints([], 0)).toEqual([]);
  });
});
