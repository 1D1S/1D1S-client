import { PostHogProvider } from './PostHogProvider';
import { TanStackQueryProvider } from './QueryClientProvider';
import { ToastProvider } from './ToastProvider';

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <TanStackQueryProvider>
      <PostHogProvider>
        <ToastProvider>{children}</ToastProvider>
      </PostHogProvider>
    </TanStackQueryProvider>
  );
}
