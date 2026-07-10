import { describe, expect, it } from 'vitest';

import { dedupeById } from './useDedupedInfinitePages';

interface Row {
  id: number;
  value: string;
}

const byId = (row: Row): number => row.id;

describe('dedupeById', () => {
  it('중복 없는 목록은 순서를 유지한다', () => {
    const rows: Row[] = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'c' },
    ];
    expect(dedupeById(rows, byId)).toEqual(rows);
  });

  it('id 중복 시 뒤에 온 항목이 앞을 덮어쓴다', () => {
    const rows: Row[] = [
      { id: 1, value: 'old' },
      { id: 2, value: 'b' },
      { id: 1, value: 'new' },
    ];
    expect(dedupeById(rows, byId)).toEqual([
      { id: 1, value: 'new' },
      { id: 2, value: 'b' },
    ]);
  });

  it('첫 등장 위치의 순서를 보존한다', () => {
    const rows: Row[] = [
      { id: 5, value: 'a' },
      { id: 3, value: 'b' },
      { id: 5, value: 'c' },
      { id: 1, value: 'd' },
    ];
    expect(dedupeById(rows, byId).map(byId)).toEqual([5, 3, 1]);
  });

  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(dedupeById([] as Row[], byId)).toEqual([]);
  });
});
