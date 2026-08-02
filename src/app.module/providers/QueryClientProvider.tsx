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
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) &&
            query.meta?.noPersist !== true,
        },
      }}
    >
      {children}
      {devtools}
    </PersistQueryClientProvider>
  );
}
