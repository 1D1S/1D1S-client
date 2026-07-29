import { describe, expect, it } from 'vitest';

import { getPeakIndex, getTrendWindow } from './BarTrend';

describe('getPeakIndex', () => {
  const bars = (...counts: number[]): Array<{ count: number }> =>
    counts.map((count) => ({ count }));

  it('동률이면 가장 최근(뒤) 인덱스를 강조한다', () => {
    // 전부 값 1 → 마지막(최신) 인덱스
    expect(getPeakIndex(bars(1, 1, 1, 1, 1, 1))).toBe(5);
  });

  it('명확한 최댓값이 하나면 그 인덱스', () => {
    expect(getPeakIndex(bars(1, 3, 2))).toBe(1);
  });

  it('최댓값이 여럿이면 마지막 최댓값', () => {
    expect(getPeakIndex(bars(3, 1, 3, 2, 3))).toBe(4);
  });

  it('0은 제외하고, 동률 0 사이의 양수를 고른다', () => {
    expect(getPeakIndex(bars(0, 2, 0, 2, 0))).toBe(3);
  });

  it('전부 0 또는 빈 배열이면 -1(강조 없음)', () => {
    expect(getPeakIndex(bars(0, 0, 0))).toBe(-1);
    expect(getPeakIndex([])).toBe(-1);
  });
});

describe('getTrendWindow', () => {
  it('최신 페이지(offset 0)는 끝에서부터 pageSize 개를 잡는다', () => {
    expect(getTrendWindow(10, 7, 0)).toEqual({
      start: 3,
      end: 10,
      pageCount: 2,
      offset: 0,
      hasOlder: true,
      hasNewer: false,
    });
  });

  it('오래된 페이지는 앞쪽(부분 페이지 가능)을 잡는다', () => {
    expect(getTrendWindow(10, 7, 1)).toEqual({
      start: 0,
      end: 3,
      pageCount: 2,
      offset: 1,
      hasOlder: false,
      hasNewer: true,
    });
  });

  it('데이터가 pageSize 이하이면 한 페이지', () => {
    expect(getTrendWindow(7, 7, 0)).toMatchObject({
      start: 0,
      end: 7,
      pageCount: 1,
      hasOlder: false,
      hasNewer: false,
    });
  });

  it('범위를 벗어난 offset 은 마지막 페이지로 클램프한다', () => {
    expect(getTrendWindow(10, 7, 9)).toMatchObject({ offset: 1, start: 0 });
  });

  it('빈 데이터도 한 페이지로 안전하게 처리한다', () => {
    expect(getTrendWindow(0, 7, 0)).toMatchObject({
      start: 0,
      end: 0,
      pageCount: 1,
    });
  });
});
