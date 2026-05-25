'use client';

import { resolveDiaryImageUrl } from '@feature/diary/shared/utils/diaryImageUrl';
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

// 네이티브 하단 탭이 향하는 4개 라우트. 웹 AppBottomNav 가 네이티브에서
// 숨겨지면서 거기서 돌던 prefetch 도 같이 사라졌기에, NativeBridge 에서
// 같은 워밍업을 재현한다.
const NATIVE_TAB_ROUTES = ['/', '/challenge', '/diary', '/mypage'] as const;

/**
 * Flutter 네이티브 쉘이 띄운 WebView 내부에서만 마운트되는 동기화 컴포넌트.
 *
 * - 네이티브 쉘에서 탭을 탭하면 `window.__NATIVE_NAV__('/...')` 호출 →
 *   `native:navigate` 이벤트 → 여기서 `router.push` 로 흡수해 SPA 전환.
 *   Flutter 측 500ms 후 `location.assign` fallback 이 있어 listener 가
 *   미처 attach 되기 전 풀 페이지 리로드가 발생할 수 있으므로 mount 시
 *   가장 먼저 이 useEffect 가 돌도록 위쪽에 배치한다.
 * - 마운트 시 4개 탭 라우트(+ 비로그인 시 /login) 를 prefetch — 네이티브
 *   에서 web AppBottomNav 가 가려지면서 그쪽 prefetch 가 같이 죽었기에,
 *   첫 탭 탭핑부터 SPA 전환이 즉시 일어나도록 워밍업한다.
 * - pathname 이 바뀔 때마다 네이티브에 `nav_state` 메시지 push → 네이티브
 *   하단 탭의 active 표시가 동기화된다.
 * - 인증/사이드바/알림 상태가 바뀔 때마다 `auth_state` 를 push → 네이티브
 *   헤더의 streak chip, 알림 dot, 프로필 아바타가 동기화된다.
 *
 * 렌더링 산출물이 없으므로 `null` 을 반환한다.
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

  useEffect(() => {
    NATIVE_TAB_ROUTES.forEach((href) => {
      router.prefetch(href);
    });
    if (!isLoggedIn) {
      router.prefetch('/login');
    }
  }, [router, isLoggedIn]);

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

  return null;
}
