'use client';

import { Button } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useUnreadCount } from '@feature/notification/hooks/useNotificationQueries';
import { authStorage } from '@module/utils/auth';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import AppBottomNav from './AppBottomNav';
import { AppLayoutProvider } from './AppLayoutContext';
import AppRightRail from './AppRightRail';
import AppTopNav from './AppTopNav';

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
  '/mypage/settings',
  '/mypage/friend',
  '/terms',
  '/privacy',
];

const NOOP_SUBSCRIBE = (): (() => void) => () => {};
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ENDLESS_MIN_YEAR = 2090;

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
    return true;
  }
  if (pathname === '/onboarding') {
    return true;
  }
  return false;
}

function isLikelyLegacyEndless(challenge: {
  title?: string;
  startDate?: string;
  endDate?: string;
}): boolean {
  if (!challenge.title?.includes('무기한')) {
    return false;
  }
  const start = new Date(challenge.startDate ?? '').getTime();
  const end = new Date(challenge.endDate ?? '').getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return false;
  }
  const durationDays = Math.ceil((end - start) / MS_PER_DAY);
  return durationDays === 7;
}

function resolveHasDeadline(challenge: {
  title?: string;
  startDate?: string;
  endDate?: string;
  hasDeadline?: boolean;
  periodType?: string;
}): boolean {
  if (typeof challenge.hasDeadline === 'boolean') {
    return challenge.hasDeadline;
  }
  if (challenge.periodType === 'ENDLESS') {
    return false;
  }
  if (isLikelyLegacyEndless(challenge)) {
    return false;
  }
  const endDate = challenge.endDate?.trim();
  if (!endDate) {
    return false;
  }
  const parsedEnd = new Date(endDate);
  if (Number.isNaN(parsedEnd.getTime())) {
    return false;
  }
  return parsedEnd.getUTCFullYear() < ENDLESS_MIN_YEAR;
}

function calculateProgress(
  startDate: string,
  endDate: string,
  now: number
): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start || now <= 0) {
    return 0;
  }
  const total = Math.max(1, Math.ceil((end - start) / MS_PER_DAY));
  const elapsed = Math.max(0, Math.ceil((now - start) / MS_PER_DAY));
  return Math.min(100, Math.round((elapsed / total) * 100));
}

let mountTimestamp = 0;
function getMountTimestamp(): number {
  if (mountTimestamp === 0) {
    mountTimestamp = Date.now();
  }
  return mountTimestamp;
}

export default function AppLayoutShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );
  const now = useSyncExternalStore(NOOP_SUBSCRIBE, getMountTimestamp, () => 0);

  const hasTokenHint = hasMounted && authStorage.hasTokens();

  const {
    data: sidebarData,
    isLoading: isSidebarLoading,
    isFetching: isSidebarFetching,
  } = useSidebar();

  const isLoggedIn =
    hasMounted &&
    hasTokenHint &&
    (Boolean(sidebarData) || isSidebarLoading || isSidebarFetching);

  // SSR/하이드레이션 직후에는 클라이언트에서만 읽히는 토큰 힌트(localStorage,
  // 쿠키)를 알 수 없어 무조건 게스트로 렌더된다. 그대로 노출하면 로그인 상태
  // 사용자가 새로고침할 때 매번 게스트→로그인으로 깜빡인다. 토큰 만료로
  // 401이 떨어지기 직전에도 같은 구간을 거치면서 직전 사용자 정보가 노출될
  // 수 있다. 인증 확정 전(`hasMounted` 이전 + 토큰 힌트는 있으나 사이드바
  // 쿼리가 아직 pending)까지는 사용자 정보 영역을 스켈레톤으로 가린다.
  // 401 → forceLogout 경로에서 sidebarData=null 로 응답이 도착하므로
  // `!sidebarData` 대신 쿼리 상태(`isSidebarLoading`)를 기준으로 판정한다.
  const isAuthLoading =
    !hasMounted || (hasTokenHint && isSidebarLoading);

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

  const { data: unreadData } = useUnreadCount({ enabled: isLoggedIn });
  const hasUnread = isLoggedIn && (unreadData?.unreadCount ?? 0) > 0;

  const railChallenges = useMemo(() => {
    if (!sidebarData) {
      return [];
    }
    return sidebarData.challengeList.map((ch) => {
      const hasDeadline = resolveHasDeadline(ch);
      return {
        id: String(ch.challengeId),
        title: ch.title,
        progress: hasDeadline
          ? calculateProgress(ch.startDate, ch.endDate, now)
          : 0,
        hasDeadline,
      };
    });
  }, [sidebarData, now]);

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

  return (
    <AppLayoutProvider
      value={{
        hasRightSidebar: showRightRail,
        isRightSidebarCollapsed: false,
      }}
    >
      <div className="flex min-h-screen w-full flex-col bg-white lg:bg-gray-50">
        {showTopNav ? (
          <AppTopNav
            activeId={activeNavId}
            isLoggedIn={isLoggedIn}
            isAuthLoading={isAuthLoading}
            hasUnread={hasUnread}
            streakDays={sidebarData?.streakCount ?? 0}
            profileImageUrl={sidebarData?.profileUrl}
            onProfileClick={() => {
              if (!isLoggedIn) {
                router.push('/login');
                return;
              }
              router.push('/mypage');
            }}
            className={topNavRespClass}
          />
        ) : null}

        {showBackButton ? (
          <div className="hidden shrink-0 px-7 pt-3 lg:flex">
            <Button variant="ghost" size="small" onClick={() => router.back()}>
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
                onChallengeClick={(id) => router.push(`/challenge/${id}`)}
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
      </div>
    </AppLayoutProvider>
  );
}
