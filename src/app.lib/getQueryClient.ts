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
      onError: (error, query) => {
        // 실패해도 토스트가 필요 없는 쿼리(예: 소셜 로그인)는 제외한다.
        // 소셜 로그인 실패는 콜백이 이미 조용히 /login 으로 돌려보낸다 —
        // 탈퇴 계정 재로그인 등 서버 메시지를 사용자에게 띄울 이유가 없다.
        if (query?.meta?.skipGlobalErrorToast === true) {
          return;
        }
        notifyOnClient(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // 실패해도 사용자에게 알릴 필요 없는 mutation(예: 로그아웃)은 제외한다.
        // 앱 컨텍스트에서 로그아웃 POST 가 네트워크 실패해 "네트워크 연결…"
        // 토스트가 반복되던 문제 — 브라우저는 성공하므로 영향 없다. 시간 창
        // (beginLogoutSuppression)과 달리 POST 가 오래 매달렸다 실패해도 확실히
        // 억제된다.
        if (mutation?.meta?.skipGlobalErrorToast === true) {
          return;
        }
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
        // 탭 전환마다 unmount/remount 되어도 캐시가 fresh 면 재요청하지 않는다.
        refetchOnMount: false,
        // 보드/홈 등 읽기 위주 데이터는 5분간 fresh 유지.
        // 개별 훅에서 더 엄격한 값으로 override 가능.
        staleTime: 5 * 60 * 1000,
        // 다른 탭에 머무는 동안 기존 탭의 캐시가 삭제되지 않도록 30분 보관.
        gcTime: 30 * 60 * 1000,
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
