'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// 페이지 이동 시 마지막 스크롤 위치가 복원되어 사용자가 혼동하는 것을 막기
// 위해 브라우저 자동 복원을 끄고 pathname 변경마다 명시적으로 맨 위로 보낸다.
// searchParams는 의존성에서 제외 — 목록/상세에서 필터/쿼리 변경만으로 스크롤이
// 튀면 오히려 어색하므로 의도적으로 같은 페이지 내 동작은 건드리지 않는다.
export default function ScrollToTop(): null {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
