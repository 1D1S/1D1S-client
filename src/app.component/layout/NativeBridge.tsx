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

/**
 * Flutter 네이티브 쉘이 띄운 WebView 내부에서만 마운트되는 동기화 컴포넌트.
 *
 * - 네이티브 쉘에서 탭을 탭하면 `window.__NATIVE_NAV__('/...')` 호출 →
 *   `native:navigate` 이벤트 → 여기서 `router.push` 로 흡수해 SPA 전환.
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
