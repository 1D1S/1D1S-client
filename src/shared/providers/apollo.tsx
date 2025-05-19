'use client';

import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, from, HttpLink } from '@apollo/client';
import { apolloLoggingLink } from '@/shared/lib/apollo_logging_link';

const client = new ApolloClient({
  link: from([
    apolloLoggingLink,
    new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL!,
      credentials: 'same-origin',
    }),
  ]),
  cache: new InMemoryCache(),
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
});

export function ApolloClientProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
