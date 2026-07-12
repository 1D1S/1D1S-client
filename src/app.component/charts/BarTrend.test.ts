import { describe, expect, it } from 'vitest';

import { getTrendWindow } from './BarTrend';

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
