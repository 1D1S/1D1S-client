'use client';

import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import {
  onNativeNavigateRequest,
  postNativeMessage,
} from '@module/utils/nativeBridge';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { AuthLayoutState } from './useAuthLayoutState';

interface NativeBridgeProps {
  authState: AuthLayoutState;
}

/**
 * Flutter 네이티브 쉘이 띄운 WebView 내부에서만 마운트되는 동기화 컴포넌트.
 *
 * Flutter 쉘은 탭마다 별도 WebViewController 를 alive 로 유지하고 IndexedStack
 * 으로 활성 탭만 화면에 보여준다. 즉 각 WebView 는 자기 탭의 라우트(`/`,
 * `/challenge`, `/diary`, `/mypage`) 만 책임지며, NativeBridge 도 그 WebView
 * 내부에서 한 인스턴스만 동작한다.
 *
 * - `native:navigate` (Flutter → 웹) 를 받아 `router.push` 로 흡수.
 *   같은 탭 안의 sub-route 이동(예: `/challenge/123`) 에 쓰인다. 다른 탭으로
 *   가는 cross-tab 이동은 Flutter 의 BottomNav 가 IndexedStack 인덱스를
 *   바꾸는 식으로 처리해서 SPA 라우팅을 사용하지 않는다.
 * - pathname 변경 시 `nav_state` → 활성 탭/back bar 가시성 결정용.
 * - 인증/사이드바/알림 변경 시 `auth_state` → 네이티브 헤더 동기화.
 * - 스크롤 방향 전환 시 `scroll_dir` → /challenge sliver AppBar 트리거.
 *
 * cross-tab `router.prefetch` 와 풀-투-리프레시 는 multi-WebView 모델에서
 * 의미가 없어 Flutter 쪽으로 위임했다 — 각 탭이 본인 페이지를 자기 WebView
 * 에서 직접 로드하고, 풀-투-리프레시 는 Flutter 가 inject 한 JS 가 잡아서
 * `pull_refresh` 메시지로 네이티브에게 reload 를 요청한다.
 */
export default function NativeBridge({
  authState,
}: NativeBridgeProps): null {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, hasUnread, sidebarData } = authState;
  const profileUrl = resolveDiaryImageUrl(sidebarData?.profileUrl ?? null);
  const streakDays = sidebarData?.streakCount ?? 0;

  useEffect(
    () => onNativeNavigateRequest((path) => router.push(path)),
    [router]
  );

  // app_ready(스플래시 dismiss)는 여기서 보내지 않는다. 첫 페인트/hydration
  // 시점이라 홈 데이터 렌더 전에 걷히던 문제가 있었다. 이제 각 랜딩 루트
  // 화면이 자기 핵심 콘텐츠가 렌더된 뒤 useSignalAppReady 로 1회 발화한다.
  useEffect(() => {
    postNativeMessage({
      type: 'nav_state',
      payload: { pathname: pathname || '/' },
    });
  }, [pathname]);

  useEffect(() => {
    postNativeMessage({
      type: 'auth_state',
      payload: {
        isLoggedIn,
        hasUnread,
        streakDays,
        profileUrl: profileUrl ?? undefined,
      },
    });
  }, [isLoggedIn, hasUnread, streakDays, profileUrl]);

  // 스크롤 방향 브릿지. 네이티브 쉘의 sliver-style AppBar collapse/expand
  // 트리거. 매 프레임 보내는 대신 방향이 바뀐 순간에만 1회 송신해 JS 채널
  // 트래픽을 최소화한다. rAF 스로틀 + 미세 떨림(<4px) 무시.
  // 라우트 분기는 Flutter 측에서 처리(/challenge 만 collapse) — 웹은 항상
  // 송신해 라우트별 정책을 네이티브 단일 소스로 둔다.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    let lastY = window.scrollY;
    let lastDir: 'up' | 'down' | null = null;
    let ticking = false;
    const onScroll = (): void => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (Math.abs(delta) > 4) {
          const dir: 'up' | 'down' = delta > 0 ? 'down' : 'up';
          if (dir !== lastDir) {
            lastDir = dir;
            postNativeMessage({
              type: 'scroll_dir',
              payload: { dir, y },
            });
          }
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
