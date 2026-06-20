'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  durationMs?: number;
}

// 0 에서 target 까지 부드럽게 증가하는 숫자를 반환한다. 마운트 시점과 target
// 변경 시(데이터 도착 등) 애니메이션한다.
// - 서버와 클라이언트 첫 페인트 모두 0 을 렌더하므로 hydration mismatch 가 없다.
// - prefers-reduced-motion 이면 즉시 target 을 반환한다.
// - requestAnimationFrame 기반이라 메인 스레드 부담이 적다.
export function useCountUp(
  target: number,
  { durationMs = 800 }: UseCountUpOptions = {}
): number {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const from = fromRef.current;
    const delta = target - from;

    // 이미 목표값(첫 마운트 시 0 등)이면 아무 것도 하지 않는다.
    if (delta === 0) {
      fromRef.current = target;
      return;
    }

    // 모션 최소화 설정이면 애니메이션 없이 한 프레임 뒤 목표값으로 점프한다.
    // (effect 본문에서 동기 setState 를 호출하지 않도록 rAF 로 미룬다.)
    if (prefersReduced) {
      fromRef.current = target;
      frameRef.current = requestAnimationFrame(() => setDisplay(target));
      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }

    let startTime: number | null = null;
    const tick = (now: number): void => {
      if (startTime === null) {
        startTime = now;
      }
      const progress = Math.min(1, (now - startTime) / durationMs);
      // easeOutCubic — 빠르게 올라가다 끝에서 부드럽게 멈춘다.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + delta * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, durationMs]);

  return display;
}
