import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { describe, expect, it } from 'vitest';

import { truncateInfinitePages } from './queryPersist';

type DehydratedQuery = PersistedClient['clientState']['queries'][number];

function makeQuery(hash: string, data: unknown): DehydratedQuery {
  return {
    queryHash: hash,
    queryKey: [hash],
    state: { data, dataUpdateCount: 1, dataUpdatedAt: 0 },
  } as unknown as DehydratedQuery;
}

function makeClient(queries: DehydratedQuery[]): PersistedClient {
  return {
    timestamp: 0,
    buster: 'test',
    clientState: { mutations: [], queries },
  };
}

function firstQueryData(client: PersistedClient): unknown {
  return client.clientState.queries[0]?.state.data;
}

describe('truncateInfinitePages', () => {
  it('무한 스크롤 쿼리를 첫 페이지만 남긴다', () => {
    const client = makeClient([
      makeQuery('diary-list', {
        pages: [{ items: ['a'] }, { items: ['b'] }, { items: ['c'] }],
        pageParams: [undefined, 'cursor-1', 'cursor-2'],
      }),
    ]);

    const result = truncateInfinitePages(client);

    expect(firstQueryData(result)).toEqual({
      pages: [{ items: ['a'] }],
      pageParams: [undefined],
    });
  });

  it('pages 와 pageParams 를 같은 인덱스로 자른다', () => {
    const client = makeClient([
      makeQuery('challenge-list', {
        pages: [{ id: 1 }, { id: 2 }],
        pageParams: ['p1', 'p2'],
      }),
    ]);

    const data = firstQueryData(truncateInfinitePages(client)) as {
      pages: unknown[];
      pageParams: unknown[];
    };

    expect(data.pages).toHaveLength(1);
    expect(data.pageParams).toHaveLength(1);
    expect(data.pageParams[0]).toBe('p1');
  });

  it('일반 useQuery 데이터는 건드리지 않는다', () => {
    const listData = [{ id: 1 }, { id: 2 }];
    const client = makeClient([makeQuery('home-random', listData)]);

    expect(firstQueryData(truncateInfinitePages(client))).toBe(listData);
  });

  it('페이지가 하나뿐이면 원본 쿼리를 그대로 재사용한다', () => {
    const query = makeQuery('single', {
      pages: [{ items: [] }],
      pageParams: [undefined],
    });

    const result = truncateInfinitePages(makeClient([query]));

    expect(result.clientState.queries[0]).toBe(query);
  });

  it('원본 캐시 객체를 변형하지 않는다', () => {
    const data = {
      pages: [{ id: 1 }, { id: 2 }],
      pageParams: [undefined, 'c1'],
    };
    const client = makeClient([makeQuery('mutation-check', data)]);

    truncateInfinitePages(client);

    // 여기서 잘리면 화면에 떠 있는 목록이 1페이지로 줄어든다.
    expect(data.pages).toHaveLength(2);
    expect(data.pageParams).toHaveLength(2);
  });
});
