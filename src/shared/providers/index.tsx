import { ApolloClientProvider } from './apollo';

export function AppProviders({ children }: { children: React.ReactNode }): React.ReactElement {
  return <ApolloClientProvider>{children}</ApolloClientProvider>;
}
