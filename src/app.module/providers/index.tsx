import { TanStackQueryProvider } from './query-client-provider';
import { ToastProvider } from './toast-provider';

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <TanStackQueryProvider>
      {children}
      <ToastProvider />
    </TanStackQueryProvider>
  );
}
