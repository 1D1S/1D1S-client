'use client';

import { Button } from '@1d1s/design-system';
import {
  AddToHomeScreenPrompt,
} from '@feature/install/components/AddToHomeScreenPrompt';
import {
  BrowserPermissionPrompt,
} from '@feature/notification/components/BrowserPermissionPrompt';
import { useTokenRefreshOnResume } from '@module/hooks/useTokenRefreshOnResume';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';

import AppBottomNav from './AppBottomNav';
import { AppLayoutProvider } from './AppLayoutContext';
import AppRightRail from './AppRightRail';
import AppTopNav from './AppTopNav';
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
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  useTokenRefreshOnResume();

  // 인증/사이드바 상태는 별도 hook 으로 묶었다. shell 은 라우트 가시성 판단과
  // 핸들러 안정화에만 집중한다.
  const { isLoggedIn, isAuthLoading, hasUnread, sidebarData, railChallenges } =
    useAuthLayoutState();

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
  // TopNav 가시성: 로그인/회원가입 페이지면 완전 제거. 그 외엔 CSS로 처리.
  const showTopNav = !isLoginPage;
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
  const showBottomNav = !isBottomNavHidden(pathname);
  const bottomNavRespClass = 'lg:hidden';
  const activeNavId = resolveActiveNavId(pathname);

  // 프로필 아바타 클릭 — pathname 이 변해 AppLayoutShell 이 재렌더돼도
  // 핸들러 참조가 안정적이어야 자식 컴포넌트의 재렌더를 피한다.
  const handleProfileClick = useCallback((): void => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    router.push('/mypage');
  }, [isLoggedIn, router]);

  const handleBackClick = useCallback((): void => {
    router.back();
  }, [router]);

  const handleRailChallengeClick = useCallback(
    (id: string): void => {
      router.push(`/challenge/${id}`);
    },
    [router]
  );

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
            <Button variant="ghost" size="small" onClick={handleBackClick}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              뒤로가기
            </Button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <main className="min-h-0 min-w-0 flex-1 overflow-x-clip">
            {children}
          </main>
          {showRightRail ? (
            <div className={cn('hidden lg:flex')}>
              <AppRightRail
                isLoggedIn={isLoggedIn}
                isAuthLoading={isAuthLoading}
                nickname={sidebarData?.nickname ?? '사용자'}
                handle={
                  sidebarData?.nickname
                    ? `@${sidebarData.nickname}`
                    : undefined
                }
                profileImageUrl={sidebarData?.profileUrl}
                streakDays={sidebarData?.streakCount ?? 0}
                todayGoalCount={sidebarData?.todayGoalCount ?? 0}
                challenges={railChallenges}
                onChallengeClick={handleRailChallengeClick}
              />
            </div>
          ) : null}
        </div>

        {showBottomNav ? (
          <AppBottomNav
            activeId={activeNavId}
            className={bottomNavRespClass}
          />
        ) : null}

        {!isLoginPage ? <BrowserPermissionPrompt /> : null}
        {!isLoginPage ? <AddToHomeScreenPrompt /> : null}
      </div>
    </AppLayoutProvider>
  );
}
