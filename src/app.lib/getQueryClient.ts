import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';

// getQueryClient 는 RSC(prefetch) 와 client 양쪽에서 호출된다.
// 따라서 이 모듈은 절대 client-only 모듈 (`@module/api/error`, `errorNotify`)
// 을 static import 하지 않는다 — 가벼운 retry 로직과 dynamic import 만 사용.

function getAxiosErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const candidate = error as {
    isAxiosError?: unknown;
    response?: { status?: number };
  };
  if (candidate.isAxiosError !== true) {
    return undefined;
  }
  return candidate.response?.status;
}

// 클라이언트 전용 toast 사이드이펙트는 dynamic import 로 분리한다.
function notifyOnClient(error: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }
  import('@module/api/errorNotify')
    .then(({ notifyApiError }) => notifyApiError(error))
    .catch(() => {
      // ignore
    });
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        notifyOnClient(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        notifyOnClient(error);
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const status = getAxiosErrorStatus(error);
          if (status === 401) {
            return false;
          }
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
