import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

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

/** 클라이언트에서만 localStorage persister 를 만든다. 서버(SSR)면 null. */
export function createRqPersister():
  | ReturnType<typeof createSyncStoragePersister>
  | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: RQ_PERSIST_KEY,
    // 캐시 갱신이 몰릴 때 쓰기를 1s 로 합쳐 메인스레드를 보호한다.
    throttleTime: 1000,
  });
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
