import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client';

// React Query 캐시를 localStorage 에 영속한다. 웹뷰가 리로드/재생성돼도(앱)
// 재fetch 없이 이전 캐시로 즉시 렌더하기 위함(브라우저 세션이 유지하던 이점을
// 웹뷰에도 부여). 클라이언트 전용 — getQueryClient(RSC 공용)와 분리한다.

export const RQ_PERSIST_KEY = '1d1s:rq-cache';

// 하루. 이보다 오래된 캐시는 복원하지 않고 버린다(이후 정상 refetch).
export const RQ_PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

// 배포마다 바뀌는 buster — 청크/응답 스키마가 바뀌면 옛 캐시를 무효화한다.
// Vercel 빌드가 커밋 SHA 를 NEXT_PUBLIC_BUILD_ID 로 inline(next.config), 로컬은
// 'dev'. 앞의 v1 은 persist 포맷 수동 버전(깨는 변경 시 올린다). DS/앱 배포는
// 모두 새 커밋 → SHA 변경 → 자동 무효화.
export const RQ_PERSIST_BUSTER = `v1-${process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev'}`;

interface InfinitePages {
  pages: unknown[];
  pageParams: unknown[];
}

function isInfiniteData(data: unknown): data is InfinitePages {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const candidate = data as Partial<InfinitePages>;
  return Array.isArray(candidate.pages) && Array.isArray(candidate.pageParams);
}

/**
 * 영속 대상에서 무한 스크롤 쿼리의 **첫 페이지만** 남긴다.
 *
 * 누적 페이지 전체(수백 KB)를 throttle 주기마다 JSON.stringify 로 동기
 * 기록하면 저사양 기기에서 스크롤 중 프레임이 끊긴다. 그렇다고 통째로
 * 제외하면(이전 동작) 리스트 탭은 복귀할 때마다 스켈레톤이다. 첫 페이지만
 * 남기면 쓰기 비용은 일반 쿼리 수준으로 유지하면서 복귀 즉시 첫 화면이
 * 채워진다 — 어차피 복원 직후 사용자가 보는 것은 첫 페이지뿐이다.
 *
 * pages/pageParams 를 **같은 인덱스로** 자르므로 복원 후 getNextPageParam
 * 은 첫 페이지를 lastPage 로 받아 다음 커서를 정상 계산한다(hasNextPage 도
 * 첫 페이지의 pageInfo 로 다시 도출된다).
 *
 * 살아있는 쿼리 캐시가 참조하는 객체를 그대로 받으므로 **변형하지 않고**
 * 새 객체로 복사한다 — 여기서 mutate 하면 화면의 목록이 1페이지로 잘린다.
 */
export function truncateInfinitePages(
  client: PersistedClient
): PersistedClient {
  return {
    ...client,
    clientState: {
      ...client.clientState,
      queries: client.clientState.queries.map((query) => {
        const data = query.state.data;
        if (!isInfiniteData(data) || data.pages.length <= 1) {
          return query;
        }
        return {
          ...query,
          state: {
            ...query.state,
            data: {
              ...data,
              pages: data.pages.slice(0, 1),
              pageParams: data.pageParams.slice(0, 1),
            },
          },
        };
      }),
    },
  };
}

/** 클라이언트에서만 localStorage persister 를 만든다. 서버(SSR)면 null. */
export function createRqPersister(): Persister | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: RQ_PERSIST_KEY,
    // 캐시 갱신이 몰릴 때 쓰기를 1s 로 합쳐 메인스레드를 보호한다.
    throttleTime: 1000,
  });
  return {
    ...persister,
    persistClient: (client) =>
      persister.persistClient(truncateInfinitePages(client)),
  };
}

/**
 * 로그아웃/탈퇴 시 영속된 RQ 캐시도 함께 비운다 — 개인/개인화 데이터가
 * localStorage 에 남지 않게. (앱도 localStorage.clear 를 하지만, 브라우저
 * 로그아웃·정합성을 위해 웹에서도 명시적으로 지운다.)
 */
export function purgePersistedQueries(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(RQ_PERSIST_KEY);
  } catch {
    // ignore
  }
}
