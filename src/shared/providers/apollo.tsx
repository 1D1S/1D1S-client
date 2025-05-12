'use client';

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

// Provider 컴포넌트
export function ApolloClientProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

