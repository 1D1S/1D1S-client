'use client';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL!,
  cache: new InMemoryCache(),
  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
  },
});

export function ApolloClientProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
