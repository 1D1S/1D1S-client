import { describe, expect, it } from 'vitest';

import { toHeatmapLevel } from './challengeStatisticsView';

describe('toHeatmapLevel', () => {
  it('0건이거나 max 가 0이면 level 0', () => {
    expect(toHeatmapLevel(0, 10)).toBe(0);
    expect(toHeatmapLevel(-3, 10)).toBe(0);
    expect(toHeatmapLevel(5, 0)).toBe(0);
  });

  it('작성이 있으면 최소 level 1 로 보이게 한다', () => {
    expect(toHeatmapLevel(1, 100)).toBe(1);
  });

  it('최댓값 대비 비율로 1~4 를 매긴다 (포화 방지)', () => {
    expect(toHeatmapLevel(10, 10)).toBe(4);
    expect(toHeatmapLevel(5, 10)).toBe(2);
    expect(toHeatmapLevel(6, 10)).toBe(3);
  });
});
