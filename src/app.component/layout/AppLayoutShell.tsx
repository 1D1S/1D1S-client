'use client';

import { Button } from '@1d1s/design-system';
import { AddToHomeScreenPrompt } from '@feature/install/components/AddToHomeScreenPrompt';
import { BrowserPermissionPrompt } from '@feature/notification/components/BrowserPermissionPrompt';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { useServiceWorkerNavigation } from '@module/hooks/useServiceWorkerNavigation';
import { useTokenRefreshOnResume } from '@module/hooks/useTokenRefreshOnResume';
import { cn } from '@module/utils/cn';
import { buildLoginUrl } from '@module/utils/returnTo';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';

import AppBottomNav from './AppBottomNav';
import { AppLayoutProvider } from './AppLayoutContext';
import AppRightRail from './AppRightRail';
import AppTopNav from './AppTopNav';
import NativeBridge from './NativeBridge';
import { useAuthLayoutState } from './useAuthLayoutState';

const TOP_NAV_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
];

const RIGHT_RAIL_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
  '/mypage',
  '/challenge/create',
  '/notification',
  '/terms',
  '/privacy',
  '/install',
];

const BOTTOM_NAV_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
  '/diary/create',
  '/challenge/create',
  '/onboarding',
  '/notification',
  '/notice',
  '/inquiry',
  '/mypage/settings',
  '/mypage/friend',
  '/terms',
  '/privacy',
  '/install',
];

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isBottomNavHidden(pathname: string): boolean {
  if (matchesRoute(pathname, BOTTOM_NAV_HIDDEN_ROUTES)) {
    return true;
  }
  // 챌린지/일지 상세는 자체 sticky CTA를 사용하므로 바텀 네비를 숨긴다.
  if (/^\/challenge\/\d+/.test(pathname)) {
    return true;
  }
  if (/^\/diary\/\d+/.test(pathname)) {
    return true;
  }
  // 다른 회원 프로필 페이지는 자체 sticky 백 헤더를 사용한다.
  if (/^\/member\/\d+\/?$/.test(pathname)) {
    return true;
  }
  return false;
}

function resolveActiveNavId(pathname: string): string {
  if (pathname.startsWith('/challenge')) {
    return 'challenge';
  }
  if (pathname.startsWith('/diary')) {
    return 'diary';
  }
  if (pathname.startsWith('/mypage')) {
    return 'mypage';
  }
  return 'home';
}

function needsBackButton(pathname: string): boolean {
  if (pathname === '/challenge/create') {
    return false;
  }
  if (/^\/challenge\/\d+\/edit\/?$/.test(pathname)) {
    return false;
  }
  if (/^\/challenge\/\d+\/.+/.test(pathname)) {
    return true;
  }
  if (pathname === '/diary/create') {
    return false;
  }
  if (pathname === '/onboarding') {
    return true;
  }
  return false;
}

export default function AppLayoutShell({
  children,
  isNativeApp: isNativeAppFromServer = false,
}: {
  children: React.ReactNode;
  // Flutter 등 네이티브 앱 쉘이 자체 헤더/바텀바를 그리는 환경에서는
  // 서버에서 user-agent 로 판정해 true 로 내려준다. 글로벌 TopNav,
  // BottomNav, PWA/푸시 권한 프롬프트를 일괄 숨긴다.
  isNativeApp?: boolean;
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  // SSR UA 매칭이 실패해 false 로 내려와도, 클라이언트에서 JS 채널/마커/
  // UA 를 다시 점검해 chrome 중복을 방지한다.
  const isNativeApp = useIsNativeApp(isNativeAppFromServer);

  // SSR 가 false 로 내려왔어도 클라이언트 감지가 true 로 바뀌면 <html> 의
  // data 속성을 동기화해, globals.css 의 sticky 헤더 차단 규칙이 즉시
  // 적용되도록 한다. RootLayout 은 App Router 에서 재렌더되지 않으므로
  // 이 effect 가 유일한 갱신 경로다.
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.dataset.nativeApp = isNativeApp
      ? 'true'
      : 'false';
  }, [isNativeApp]);

  useTokenRefreshOnResume();
  // 알림 클릭 시 서비스워커가 보낸 딥링크를 라우터 push 로 처리(뒤로가기 보존).
  useServiceWorkerNavigation();

  // 인증/사이드바 상태는 별도 hook 으로 묶었다. shell 은 라우트 가시성 판단과
  // 핸들러 안정화에만 집중한다.
  const authState = useAuthLayoutState();
  const { isLoggedIn, isAuthLoading, hasUnread, sidebarData, railChallenges } =
    authState;

  useEffect(() => {
    if (
      !isLoggedIn ||
      !sidebarData ||
      pathname === '/signup' ||
      pathname === '/login' ||
      pathname.startsWith('/auth')
    ) {
      return;
    }
    if (!sidebarData.nickname) {
      router.replace('/signup');
    }
  }, [isLoggedIn, sidebarData, pathname, router]);

  const isLoginPage = matchesRoute(pathname, TOP_NAV_HIDDEN_ROUTES);
  // TopNav 가시성: 로그인/회원가입 페이지거나 네이티브 앱 쉘이면 완전 제거.
  // 그 외엔 CSS로 처리.
  const showTopNav = !isLoginPage && !isNativeApp;
  // 모든 라우트에서 `lg`(1024px) 기준으로 데스크탑/태블릿 전환을 통일한다.
  // - 데스크탑(≥lg): 글로벌 TopNav 노출
  // - 태블릿/모바일(<lg): 글로벌 TopNav 숨김, BottomNav 노출
  //   (페이지별 자체 sticky 헤더가 있으면 화면 상단을 채운다)
  const topNavRespClass = 'hidden lg:flex';

  const showBackButton = needsBackButton(pathname);
  const isContentRouteForRail = !matchesRoute(
    pathname,
    RIGHT_RAIL_HIDDEN_ROUTES
  );
  const showRightRail = isContentRouteForRail;
  const showBottomNav = !isBottomNavHidden(pathname) && !isNativeApp;
  const bottomNavRespClass = 'lg:hidden';
  const activeNavId = resolveActiveNavId(pathname);

  // 프로필 아바타 클릭 — pathname 이 변해 AppLayoutShell 이 재렌더돼도
  // 핸들러 참조가 안정적이어야 자식 컴포넌트의 재렌더를 피한다.
  const handleProfileClick = useCallback((): void => {
    if (!isLoggedIn) {
      // 로그인 후 원래 목적지(마이페이지)로 복귀
      router.push(buildLoginUrl('/mypage'));
      return;
    }
    router.push('/mypage');
  }, [isLoggedIn, router]);

  const handleBackClick = useCallback((): void => {
    router.back();
  }, [router]);

  // Context value 객체를 매 렌더마다 새로 만들면 모든 구독자가 재렌더된다.
  // showRightRail 이 실제로 바뀔 때만 새 객체를 만든다.
  const layoutContextValue = useMemo(
    () => ({
      hasRightSidebar: showRightRail,
      isRightSidebarCollapsed: false,
    }),
    [showRightRail]
  );

  return (
    <AppLayoutProvider value={layoutContextValue}>
      <div className="flex min-h-screen w-full flex-col bg-white">
        {showTopNav ? (
          <AppTopNav
            activeId={activeNavId}
            isLoggedIn={isLoggedIn}
            isAuthLoading={isAuthLoading}
            hasUnread={hasUnread}
            streakDays={sidebarData?.streakCount ?? 0}
            profileImageUrl={sidebarData?.profileUrl}
            onProfileClick={handleProfileClick}
            className={topNavRespClass}
          />
        ) : null}

        {showBackButton ? (
          <div className="hidden shrink-0 px-7 pt-3 lg:flex">
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              뒤로가기
            </Button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          {/* overflow-x-clip 로 가로 넘침을 막되, overflow-clip-margin 으로
              카드 hover 그림자/살짝 떠오르는 효과가 잘리지 않게 24px 여유를
              둔다. clip 은 스크롤바를 만들지 않으므로 가로 스크롤은 그대로 차단된다. */}
          <main className="min-h-0 min-w-0 flex-1 overflow-x-clip [overflow-clip-margin:1.5rem]">
            {children}
          </main>
          {showRightRail ? (
            <div className={cn('hidden lg:flex')}>
              <AppRightRail
                isLoggedIn={isLoggedIn}
                isAuthLoading={isAuthLoading}
                nickname={sidebarData?.nickname ?? '사용자'}
                handle={
                  sidebarData?.nickname ? `@${sidebarData.nickname}` : undefined
                }
                profileImageUrl={sidebarData?.profileUrl}
                streakDays={sidebarData?.streakCount ?? 0}
                todayGoalCount={sidebarData?.todayGoalCount ?? 0}
                challenges={railChallenges}
              />
            </div>
          ) : null}
        </div>

        {showBottomNav ? (
          <AppBottomNav activeId={activeNavId} className={bottomNavRespClass} />
        ) : null}

        {!isLoginPage && !isNativeApp ? <BrowserPermissionPrompt /> : null}
        {!isLoginPage && !isNativeApp ? <AddToHomeScreenPrompt /> : null}
        {isNativeApp ? <NativeBridge authState={authState} /> : null}
      </div>
    </AppLayoutProvider>
  );
}
