import {
  dehydrate,
  HydrationBoundary,
  QueryFunction,
  QueryKey,
} from '@tanstack/react-query';

import { getQueryClient } from './get-query-client';

interface PrefetchOptions<TData> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
}

/**
 * 서버 컴포넌트에서 데이터를 prefetch하고 HydrationBoundary로 감싸서 반환
 *
 * @example
 * // 서버 컴포넌트에서 사용
 * export default async function ChallengePage() {
 *   return (
 *     <Prefetch
 *       queries={[
 *         { queryKey: ['challenges'], queryFn: fetchChallenges },
 *         { queryKey: ['user'], queryFn: fetchUser },
 *       ]}
 *     >
 *       <ChallengeList />
 *     </Prefetch>
 *   );
 * }
 */
export async function Prefetch<TData>({
  queries,
  children,
}: {
  queries: Array<PrefetchOptions<TData>>;
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const queryClient = getQueryClient();

  await Promise.all(
    queries.map(({ queryKey, queryFn }) =>
      queryClient.prefetchQuery({ queryKey, queryFn })
    )
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

/**
 * 단일 쿼리 prefetch 헬퍼
 *
 * @example
 * // 서버 컴포넌트에서 사용
 * export default async function ChallengeDetailPage({ params }: { params: { id: string } }) {
 *   return (
 *     <PrefetchQuery
 *       queryKey={['challenge', params.id]}
 *       queryFn={() => fetchChallengeDetail(params.id)}
 *     >
 *       <ChallengeDetail />
 *     </PrefetchQuery>
 *   );
 * }
 */
export async function PrefetchQuery<TData>({
  queryKey,
  queryFn,
  children,
}: PrefetchOptions<TData> & {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({ queryKey, queryFn });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
