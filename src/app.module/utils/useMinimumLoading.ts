import { useEffect, useRef, useState } from 'react';

/**
 * 스켈레톤이 최소로 유지되는 시간 (ms).
 * 네트워크가 매우 빠를 때 스켈레톤이 한 프레임만 깜빡이고 사라지는 현상을
 * 막기 위해 사용한다. 필요 시 이 값을 조정한다.
 */
export const SKELETON_MIN_DURATION_MS = 550;

/**
 * `isLoading` 이 true 였던 순간부터 최소 `minMs` 만큼은 true 로 유지한다.
 * 네트워크 응답이 너무 빨라 스켈레톤이 깜빡이는 현상을 막는 용도다.
 */
export function useMinimumLoading(
  isLoading: boolean,
  minMs: number = SKELETON_MIN_DURATION_MS
): boolean {
  // held 는 lazy initializer 로 mount 시점의 isLoading 을 그대로 받는다.
  // 이렇게 해야 mount 직후 첫 렌더부터 스켈레톤이 보장된다.
  const [held, setHeld] = useState<boolean>(isLoading);
  const startRef = useRef<number | null>(null);

  // isLoading 이 false→true 로 바뀌는 순간을 render 단계에서 동기 감지.
  // effect 안에서만 setHeld(true) 하면, isLoading=true 진입 직후 첫 렌더에서
  // held=false 가 그대로 노출됐다가, effect 가 돌고 난 뒤에야 true 로
  // 바뀌면서 한 프레임 깜빡임이 발생한다.
  if (isLoading && !held) {
    setHeld(true);
  }

  useEffect(() => {
    if (isLoading) {
      if (startRef.current === null) {
        startRef.current = Date.now();
      }
      return;
    }

    if (startRef.current === null) {
      return;
    }

    const remaining = Math.max(0, minMs - (Date.now() - startRef.current));
    // setHeld 는 timer 콜백(비동기)에서만 호출되므로 effect 안에서 직접
    // setState 하지 않는다 — react-hooks/set-state-in-effect 위반 회피.
    const timer = setTimeout(() => {
      startRef.current = null;
      setHeld(false);
    }, remaining);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, minMs]);

  return held;
}
