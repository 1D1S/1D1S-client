import { describe, expect, it } from 'vitest';

import { computeBarHeightPx } from './statisticsView';

describe('computeBarHeightPx', () => {
  it('scales to the max bucket in pixels', () => {
    // 최댓값 막대는 전체 영역 높이를 채운다.
    expect(computeBarHeightPx(10, 10, 100)).toBe(100);
    // 절반 값은 절반 높이.
    expect(computeBarHeightPx(5, 10, 100)).toBe(50);
  });

  it('keeps positive counts visible with a 6px floor', () => {
    // 비율이 아주 작아도 최소 6px 로 보장해 막대가 사라지지 않는다.
    expect(computeBarHeightPx(1, 1000, 100)).toBe(6);
  });

  it('renders zero counts as a thin trace', () => {
    expect(computeBarHeightPx(0, 10, 100)).toBe(2);
  });

  it('handles all-zero data without dividing by zero', () => {
    expect(computeBarHeightPx(0, 0, 100)).toBe(2);
  });

  it('returns 0 when there is no area to draw in', () => {
    expect(computeBarHeightPx(5, 10, 0)).toBe(0);
  });
});
