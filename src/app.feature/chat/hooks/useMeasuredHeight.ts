'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 요소의 실제 높이를 잰다.
 *
 * 떠 있는 배너가 리스트를 가리지 않게 그만큼 비워 둬야 하는데, 배너는 두
 * 개일 수도 접혔다 펴질 수도 있다 — 상수로 박으면 배너가 바뀔 때마다
 * 어긋난다. ResizeObserver 로 실측한다.
 */
export function useMeasuredHeight(): {
  ref(node: HTMLElement | null): void;
  height: number;
} {
  const [height, setHeight] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    []
  );

  const ref = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    if (!node) {
      setHeight(0);
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(node);
    observerRef.current = observer;
    setHeight(node.getBoundingClientRect().height);
  }, []);

  return { ref, height };
}
