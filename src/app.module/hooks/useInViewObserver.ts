'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 대상 ref가 뷰포트 안으로 진입했는지 여부를 추적한다.
 * IntersectionObserver 미지원 환경(SSR/구형 브라우저)에서는 항상 true 를 반환해
 * 무한 스크롤 트리거가 차단되지 않도록 한다.
 */
export function useInViewObserver(): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [observedInView, setObservedInView] = useState(false);
  const isIntersectionObserverUnsupported =
    typeof window !== 'undefined' &&
    typeof IntersectionObserver === 'undefined';

  useEffect(() => {
    const target = ref.current;

    if (!target || typeof window === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setObservedInView(entry.isIntersecting);
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const inView = isIntersectionObserverUnsupported ? true : observedInView;

  return { ref, inView };
}
