import { TanStackQueryProvider } from './query-client-provider';

export function AppProviders({ children }: { children: React.ReactNode }): React.ReactElement {
  return <TanStackQueryProvider>{children}</TanStackQueryProvider>;
}
