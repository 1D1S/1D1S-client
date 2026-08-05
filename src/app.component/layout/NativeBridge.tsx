'use client';

import { resolveDiaryImageUrl } from '@module/utils/diaryImageUrl';
import {
  onNativeNavigateRequest,
  postNativeMessage,
} from '@module/utils/nativeBridge';
import {
  isNativeTabBackground,
  subscribeNativeTabVisibility,
} from '@module/utils/nativeTabVisibility';
import { focusManager, useQueryClient } from '@tanstack/react-query';
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
 * - 셸이 알려 주는 탭 전경/배경(`native:tab_visibility`) → focus 리페치 게이트.
 *
 * `scroll_dir` 송신은 제거했다. /challenge 헤더가 AppBoardHeader 로 바뀌면서
 * 셸에 소비자가 사라졌는데도 웹은 계속 보내고 있었다 — 스크롤하는 내내 방향이
 * 바뀔 때마다 JS 채널을 왕복하는, 아무도 읽지 않는 트래픽이었다. 헤더
 * collapse 를 되살릴 땐 셸의 수신부와 함께 복원할 것.
 *
 * Pull-to-refresh: 당김 감지는 셸이 한다(iOS 러버밴딩 / Android 주입 JS).
 * 트리거되면 셸이 `native:pull_refresh` (cancelable) 를 쏘고, 여기서
 * preventDefault + 쿼리 무효화·리페치로 처리한 뒤 `pull_refresh_done` 으로
 * 끝을 알린다. 문서 리로드가 아니라서 (1) 안드로이드 HTTP 캐시에 안 막히고
 * (2) localStorage 쿼리 캐시 rehydration(refetchOnMount:false)에도 안 막히며
 * (3) 스크롤·하이드레이션 비용 없이 데이터만 새로 온다. 리스너가 없는 구버전
 * 웹에서는 셸이 기존처럼 문서를 리로드한다.
 */
export default function NativeBridge({
  authState,
}: NativeBridgeProps): null {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, hasUnread, sidebarData } = authState;
  const profileUrl = resolveDiaryImageUrl(sidebarData?.profileUrl ?? null);
  const streakDays = sidebarData?.streakCount ?? 0;

  useEffect(
    () => onNativeNavigateRequest((path) => router.push(path)),
    [router]
  );

  // 셸의 pull-to-refresh 위임 수신. preventDefault 가 "웹이 처리한다"
  // 시그널이다 — 셸은 dispatchEvent 반환값으로 문서 리로드 폴백 여부를
  // 정한다(native:navigate 와 같은 규약).
  useEffect(() => {
    const onPullRefresh = (event: Event): void => {
      event.preventDefault();
      void queryClient
        .invalidateQueries()
        .finally(() => postNativeMessage({ type: 'pull_refresh_done' }));
    };
    window.addEventListener('native:pull_refresh', onPullRefresh);
    return () =>
      window.removeEventListener('native:pull_refresh', onPullRefresh);
  }, [queryClient]);

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

  // 배경 탭에서는 focus 리페치를 끈다.
  //
  // 셸은 탭마다 WebView 를 살려 두고 활성 탭만 그린다. 그런데 앱이 백그라운드
  // 에서 돌아오면 **다섯 문서 전부**가 focus/visibilitychange 를 받는다 —
  // FRESH_ON_RETURN(`refetchOnWindowFocus:'always'`) 을 쓰는 홈·챌린지·일지·
  // 알림 쿼리가 동시에 재요청되고, 그중 넷은 사용자가 보고 있지도 않은
  // 화면이다. 복귀 직후는 셸도 핸드셰이크 재주입·위젯 갱신으로 가장 바쁜
  // 구간이라 그 스파이크가 그대로 끊김이 된다.
  //
  // 보이지 않는 동안 focus 를 false 로 눌러 두면 그 넷이 조용해지고, 사용자가
  // 그 탭을 누르는 순간 배경 해제 → focus true 전이가 일어나 **그때** 리페치가
  // 돈다. 즉 최신성은 유지되고 시점만 필요한 때로 옮겨진다.
  useEffect(() => {
    const apply = (background: boolean): void => {
      focusManager.setFocused(background ? false : undefined);
    };
    apply(isNativeTabBackground());
    const unsubscribe = subscribeNativeTabVisibility(apply);
    return () => {
      unsubscribe();
      // 기본 감지(브라우저 focus 이벤트)로 되돌린다.
      focusManager.setFocused(undefined);
    };
  }, []);

  return null;
}
