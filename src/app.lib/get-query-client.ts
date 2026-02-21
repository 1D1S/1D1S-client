import {
  isUnauthorizedError,
  normalizeApiError,
  notifyApiError,
} from '@module/api/error';
import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        notifyApiError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        notifyApiError(error);
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (isUnauthorizedError(error)) {
            return false;
          }

          const { status } = normalizeApiError(error);
          if (status && status >= 400 && status < 500) {
            return false;
          }

          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
      mutations: {
        retry: false,
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
