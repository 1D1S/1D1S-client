'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * 뒤로 가기 동작을 안전하게 처리한다.
 *
 * 푸시 알림/딥링크로 새 탭(또는 standalone PWA)이 열리면 history 스택에
 * 항목이 하나뿐이라 `router.back()` 이 아무 동작도 하지 않는다. 또한 화면
 * 사이를 `router.push` 로 오가면 history 가 계속 쌓여 두 화면이 서로를 밀어
 * 넣는 핑퐁 루프에 빠질 수 있다.
 *
 * 이전 history 가 있으면 `router.back()` 으로 자연스럽게 한 단계 돌아가고,
 * 없으면(=직접 진입) `fallbackHref` 로 이동한다.
 */
export function useSafeBack(fallbackHref = '/'): () => void {
  const router = useRouter();

  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);
}
