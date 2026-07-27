'use client';

import { signalAppContentReady } from '@module/utils/appReady';
import { useEffect } from 'react';

/**
 * `ready` 가 처음 true 가 되는 순간(랜딩 루트 화면의 핵심 콘텐츠가 렌더된 뒤)
 * `app_ready` 를 1회 보낸다. requestAnimationFrame 으로 실제 페인트가 커밋된
 * 다음 프레임에 보내, 스플래시가 걷혔을 때 완성 화면이 이미 떠 있게 한다.
 *
 * 각 바텀네비 루트 화면이 자기 로딩 플래그로 `ready` 를 계산해 넘긴다. 어느
 * 루트로 시작하든 그 화면이 준비되면 신호가 나간다. (Rules of Hooks — 조건부
 * early return 위에서 호출할 것.)
 */
export function useSignalAppReady(ready: boolean): void {
  useEffect(() => {
    if (!ready) {
      return;
    }
    const raf = requestAnimationFrame(() => signalAppContentReady());
    return () => cancelAnimationFrame(raf);
  }, [ready]);
}
