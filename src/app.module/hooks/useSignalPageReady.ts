'use client';

import { useNativeCapability } from '@module/hooks/useNativeCapability';
import {
  isNativeSkeletonAvailable,
  sendNativePageReady,
} from '@module/utils/nativeBridge';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * 화면 콘텐츠가 실제로 렌더된 뒤 `page_ready{screen, route}` 를 1회 보낸다.
 *
 * app_ready(부팅 1회, 스플래시)와 달리 **화면 진입(route)마다** 발화한다 —
 * SPA 로 다른 화면에 들어갈 때마다 앱이 그 화면의 네이티브 스켈레톤을 걷도록.
 * `ready` 는 성공/에러/빈 상태 등 최종 UI 가 렌더된 시점을 뜻한다(스켈레톤이
 * 걷힌 순간). requestAnimationFrame 으로 페인트 커밋 다음 프레임에 보낸다.
 *
 * - route(pathname) 당 1회. route 가 바뀌면 다시 무장한다.
 * - native_skeleton 피처를 announce 한 앱에서만 emit(브라우저·구버전은 no-op).
 *   Rules of Hooks — 조건부 early return 위에서 호출할 것.
 *
 * 피처 게이트는 반드시 **반응형**이어야 한다(useNativeCapability). 예전엔
 * effect 안에서 isNativeSkeletonAvailable() 를 직접 호출했는데, 앱은
 * 핸드셰이크를 onPageFinished 에서 주입하므로 `__1D1S_FEATURES__` 가
 * 하이드레이션보다 늦게 채워질 수 있다. ready 가 첫 렌더부터 true 인 화면
 * (RQ persist 캐시가 즉시 히트하는 challenge_board 등)은 effect 가 플래그
 * 주입 **전에** 한 번 돌고 게이트에 걸려 끝났고, deps 가 그대로라 재시도도
 * 없어 page_ready 가 영구 유실됐다 — 앱 스켈레톤이 12초 상한까지 안 걷혔다.
 * useNativeCapability 는 `native:ready` 를 구독하므로 플래그가 늦게 와도
 * false→true 로 리렌더가 걸리고, deps 에 들어간 이 값이 바뀌면서 effect 가
 * 다시 돌아 emit 한다(주입 순서와 무관).
 *
 * @param screenId 계약상 화면 식별자(예: 'diary_detail').
 * @param ready 화면 핵심 콘텐츠가 렌더됐는지(스켈레톤 종료 플래그).
 */
export function useSignalPageReady(screenId: string, ready: boolean): void {
  const pathname = usePathname();
  const signaledRouteRef = useRef<string | null>(null);
  const nativeSkeleton = useNativeCapability(isNativeSkeletonAvailable);

  useEffect(() => {
    if (!ready || signaledRouteRef.current === pathname) {
      return;
    }
    if (!nativeSkeleton) {
      // 아직 핸드셰이크 전. 플래그가 도착하면 이 effect 가 다시 돈다.
      return;
    }
    signaledRouteRef.current = pathname;
    // double rAF: 첫 rAF 는 현재 프레임 페인트 "전"에 돌고, 그 안의 두 번째
    // rAF 는 그 프레임이 실제 페인트된 "다음"에 돈다. 즉 콘텐츠가 DOM 에
    // 커밋+페인트된 뒤 emit → 앱이 네이티브 스켈레톤을 너무 일찍 걷어 생기던
    // "잠깐 흰 화면"을 막는다.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() =>
        sendNativePageReady(screenId, pathname)
      );
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [ready, nativeSkeleton, pathname, screenId]);
}
