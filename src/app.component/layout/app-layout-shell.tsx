'use client';

import {
  AppHeader,
  RightSidebar,
  type RightSidebarChallenge,
  type RightSidebarProps,
} from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/use-member-queries';
import { authStorage } from '@module/utils/auth';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  useMemo,
  useSyncExternalStore,
} from 'react';

import { AppLayoutProvider } from './app-layout-context';

const HEADER_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
];
const RIGHT_SIDEBAR_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
  '/diary/create',
  '/mypage',
  '/challenge/create',
];
const FULL_BLEED_ROUTES = ['/auth/login', '/login', '/auth/signup', '/signup'];

const APP_HEADER_NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'explore', label: '탐색' },
  { key: 'community', label: '커뮤니티' },
] as const;

const APP_HEADER_ROUTE_BY_KEY: Record<string, string> = {
  home: '/',
  explore: '/challenge',
  community: '/diary',
};

const DEFAULT_RIGHT_SIDEBAR_PROPS: RightSidebarProps = {
  userName: '사용자',
  userHandle: '@user',
  streakDays: 0,
  challenges: [],
};

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function resolveActiveNavKey(pathname: string): string {
  if (pathname.startsWith('/challenge')) {
    return 'explore';
  }

  if (pathname.startsWith('/diary')) {
    return 'community';
  }

  return 'home';
}

function isChallengeDetailRoute(pathname: string): boolean {
  if (!pathname.startsWith('/challenge/')) {
    return false;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    return false;
  }

  return segments[1] !== 'create';
}

const NOOP_SUBSCRIBE = (): (() => void) => () => {};
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ENDLESS_MIN_YEAR = 2090;

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

let mountTimestamp = 0;
function getMountTimestamp(): number {
  if (mountTimestamp === 0) {
    mountTimestamp = Date.now();
  }
  return mountTimestamp;
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
  const now = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    getMountTimestamp,
    () => 0
  );

  const isLoggedIn = hasMounted && authStorage.hasTokens();
  const { data: sidebarData } = useSidebar();

  const sidebarProps: RightSidebarProps = useMemo(() => {
    if (!sidebarData) {
      return DEFAULT_RIGHT_SIDEBAR_PROPS;
    }

    const challenges: RightSidebarChallenge[] = sidebarData.challengeList.map(
      (ch) => {
        const hasDeadline = resolveHasDeadline(ch);
        return {
          id: String(ch.challengeId),
          title: ch.title,
          progress: hasDeadline
            ? calculateProgress(ch.startDate, ch.endDate, now)
            : 0,
          hasDeadline,
        };
      }
    );

    return {
      userName: sidebarData.nickname,
      userHandle: `오늘의 목표 ${sidebarData.todayGoalCount}개`,
      userImage: sidebarData.profileUrl,
      streakDays: sidebarData.streakCount,
      challenges,
    };
  }, [sidebarData, now]);
  const showHeader = !matchesRoute(pathname, HEADER_HIDDEN_ROUTES);
  const showRightSidebar =
    !matchesRoute(pathname, RIGHT_SIDEBAR_HIDDEN_ROUTES) &&
    !isChallengeDetailRoute(pathname);
  const isFullBleedRoute = matchesRoute(pathname, FULL_BLEED_ROUTES);
  const activeNavKey = resolveActiveNavKey(pathname);
  const sidebarStickyTopClass = showHeader ? 'top-28' : 'top-6';

  return (
    <AppLayoutProvider
      value={{
        hasRightSidebar: showRightSidebar,
        isRightSidebarCollapsed: false,
      }}
    >
      <div className="flex min-h-screen w-screen flex-col bg-white">
        {showHeader ? (
          <header className="sticky top-0 z-30 shrink-0 bg-white px-4 pt-3">
            <AppHeader
              navItems={[...APP_HEADER_NAV_ITEMS]}
              activeKey={activeNavKey}
              showProfile={isLoggedIn && !showRightSidebar && pathname !== '/mypage'}
              onLogoClick={() => router.push('/')}
              onNavChange={(key) => {
                const route = APP_HEADER_ROUTE_BY_KEY[key];
                if (route) {
                  router.push(route);
                }
              }}
              onProfileClick={() => router.push('/mypage')}
            />
          </header>
        ) : null}

        {showRightSidebar ? (
          <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden">
              {children}
            </main>
            <aside
              className={`sticky ${sidebarStickyTopClass} h-fit min-h-0 shrink-0 self-start pt-3 pr-3`}
            >
              {hasMounted ? (
                <RightSidebar
                  {...sidebarProps}
                  isLoggedIn={isLoggedIn}
                  fixed={false}
                  onWriteDiary={() => router.push('/diary/create')}
                  onGoMyPage={() => router.push('/mypage')}
                  onLogin={() => router.push('/login')}
                />
              ) : (
                <div className="w-69" />
              )}
            </aside>
          </div>
        ) : (
          <main
            className={`min-h-0 min-w-0 flex-1 ${isFullBleedRoute ? '' : 'px-4 pb-4'}`}
          >
            {children}
          </main>
        )}
      </div>
    </AppLayoutProvider>
  );
}
