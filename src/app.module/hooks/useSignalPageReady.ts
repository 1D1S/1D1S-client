'use client';

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
 * @param screenId 계약상 화면 식별자(예: 'diary_detail').
 * @param ready 화면 핵심 콘텐츠가 렌더됐는지(스켈레톤 종료 플래그).
 */
export function useSignalPageReady(screenId: string, ready: boolean): void {
  const pathname = usePathname();
  const signaledRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || signaledRouteRef.current === pathname) {
      return;
    }
    if (!isNativeSkeletonAvailable()) {
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
  }, [ready, pathname, screenId]);
}
