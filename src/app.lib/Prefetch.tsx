import {
  dehydrate,
  HydrationBoundary,
  type QueryFunction,
  type QueryKey,
} from '@tanstack/react-query';
import React from 'react';

import { getQueryClient } from '@/app.lib/getQueryClient';

interface PrefetchEntry {
  queryKey: QueryKey;
  queryFn: QueryFunction<unknown>;
}

interface PrefetchInfiniteEntry {
  type: 'infinite';
  queryKey: QueryKey;
  // pageParam 의 초기값은 일반적으로 undefined (cursor-based) 이거나 1 (page-based)
  initialPageParam: unknown;
  queryFn: QueryFunction<unknown, QueryKey, unknown>;
}

type AnyPrefetchEntry = PrefetchEntry | PrefetchInfiniteEntry;

/**
 * 서버 컴포넌트에서 여러 쿼리를 prefetch 한 뒤 HydrationBoundary 로 래핑.
 *
 * - `type: 'infinite'` 가 지정된 항목은 `prefetchInfiniteQuery` 로 처리.
 * - 각 쿼리는 독립적으로 시도하며, 실패해도 prefetch 자체는 throw 하지 않으므로
 *   페이지 렌더가 깨지지 않는다.
 */
export async function Prefetch({
  queries,
  children,
}: {
  queries: AnyPrefetchEntry[];
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const queryClient = getQueryClient();

  await Promise.all(
    queries.map((entry) => {
      if ('type' in entry && entry.type === 'infinite') {
        return queryClient.prefetchInfiniteQuery({
          queryKey: entry.queryKey,
          queryFn: entry.queryFn,
          initialPageParam: entry.initialPageParam,
        });
      }
      return queryClient.prefetchQuery({
        queryKey: entry.queryKey,
        queryFn: entry.queryFn,
      });
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
