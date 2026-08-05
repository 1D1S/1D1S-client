'use client';

import {
  defaultShouldDehydrateQuery,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React, { useState } from 'react';

import { getQueryClient } from '@/app.lib/getQueryClient';
import {
  createRqPersister,
  RQ_PERSIST_BUSTER,
  RQ_PERSIST_MAX_AGE,
} from '@/app.lib/queryPersist';

export function TanStackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const queryClient = getQueryClient();
  // persister 는 클라이언트에서만 생성(SSR 은 null → 기본 provider).
  const [persister] = useState(() => createRqPersister());

  const devtools = process.env.NODE_ENV === 'development' && (
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
  );

  // localStorage 불가(SSR/구형) — 영속 없이 기본 provider 로 폴백.
  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {devtools}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: RQ_PERSIST_MAX_AGE,
        buster: RQ_PERSIST_BUSTER,
        dehydrateOptions: {
          // 성공 쿼리만 저장(pending/error 제외) + meta.noPersist 옵트아웃.
          // 무한 스크롤 쿼리도 제외한다 — 누적 페이지 전체가 1초마다
          // JSON.stringify 로 localStorage 에 동기 기록되면(수백 KB) 저사양
          // 기기에서는 스크롤 중 수 프레임짜리 멈춤이 된다. 복원해 봤자
          // 첫 페이지만 보여주면 되는 데이터라 저장 가치도 낮다.
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) &&
            query.meta?.noPersist !== true &&
            !Array.isArray(
              (query.state.data as { pageParams?: unknown[] } | undefined)
                ?.pageParams
            ),
        },
      }}
    >
      {children}
      {devtools}
    </PersistQueryClientProvider>
  );
}
