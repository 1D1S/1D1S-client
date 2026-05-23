import { useEffect, useRef, useState } from 'react';

/**
 * 스켈레톤이 최소로 유지되는 시간 (ms).
 * 네트워크가 매우 빠를 때 스켈레톤이 한 프레임만 깜빡이고 사라지는 현상을
 * 막기 위해 사용한다. 필요 시 이 값을 조정한다.
 */
export const SKELETON_MIN_DURATION_MS = 300;

/**
 * `isLoading` 이 true 였던 순간부터 최소 `minMs` 만큼은 true 로 유지한다.
 * 네트워크 응답이 너무 빨라 스켈레톤이 깜빡이는 현상을 막는 용도다.
 */
export function useMinimumLoading(
  isLoading: boolean,
  minMs: number = SKELETON_MIN_DURATION_MS
): boolean {
  const [held, setHeld] = useState<boolean>(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (startRef.current === null) {
        startRef.current = Date.now();
      }
      return;
    }

    const start = startRef.current;
    if (start === null) {
      return;
    }
    startRef.current = null;

    const remaining = Math.max(0, minMs - (Date.now() - start));
    if (remaining === 0) {
      return;
    }

    // 로딩→완료 전환 시점에 한 번만 호출되므로 cascading 위험이 없다.
    // 타이머가 끝나면 setHeld(false) 로 자연스럽게 풀린다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeld(true);
    const timer = setTimeout(() => {
      setHeld(false);
    }, remaining);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, minMs]);

  return isLoading || held;
}
