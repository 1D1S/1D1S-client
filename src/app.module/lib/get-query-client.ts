import { QueryClient, isServer } from '@tanstack/react-query';
import { handleAuthError } from './handle-auth-error';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // 401 에러는 재시도하지 않음
          if (error instanceof Error && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401) {
              return false;
            }
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
      mutations: {
        retry: false,
        onError: (error) => {
          handleAuthError(error);
        },
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          query.state.status === 'success' || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
