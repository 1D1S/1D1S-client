'use client';

import { Button } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useUnreadCount } from '@feature/notification/hooks/useNotificationQueries';
import { authStorage } from '@module/utils/auth';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { BetaButton } from '../BetaButton';
import AppBottomNav from './AppBottomNav';
import { AppLayoutProvider } from './AppLayoutContext';
import AppRightRail from './AppRightRail';
import AppTopNav from './AppTopNav';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const TOP_NAV_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
];

// 데스크탑 미만(모바일/태블릿)에서 글로벌 top-nav를 숨긴다. 이런 라우트는
// 자체 sticky 헤더를 가지거나 (보드/생성/작성), 자체 floating 뒤로가기
// 버튼을 가진다 (상세). 자체 헤더가 `lg:hidden`이므로 태블릿에서도 동일하게
// 글로벌 nav를 숨겨야 헤더가 이중으로 나오지 않는다.
const TOP_NAV_BELOW_DESKTOP_HIDDEN_ROUTES = [
  '/diary/create',
  '/challenge/create',
  '/notification',
  '/mypage/settings',
  '/mypage/friend',
];

const RIGHT_RAIL_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
  '/mypage',
  '/challenge/create',
  '/notification',
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
  return false;
}

function isTopNavBelowDesktopHidden(pathname: string): boolean {
  if (matchesRoute(pathname, TOP_NAV_BELOW_DESKTOP_HIDDEN_ROUTES)) {
    return true;
  }
  // 챌린지/일지 보드 — 페이지에 자체 sticky 헤더가 있음.
  if (pathname === '/challenge' || pathname === '/diary') {
    return true;
  }
  // 챌린지/일지 상세 — 페이지에 자체 헤더/뒤로가기 버튼이 있음.
  if (/^\/challenge\/\d+(?:\/.*)?$/.test(pathname)) {
    return true;
  }
  if (/^\/diary\/\d+(?:\/.*)?$/.test(pathname)) {
    return true;
  }
  return false;
}

function isTopNavMobileOnlyHidden(pathname: string): boolean {
  // 마이페이지 메인 — 모바일에서만 자체 프로필 카드가 헤더 역할을 대신한다.
  // 태블릿/데스크탑에서는 글로벌 nav가 필요하다.
  return pathname === '/mypage';
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
  // 메인 챌린지/일지 상세는 글로벌 nav만 사용 — back 버튼 숨김.
  // 하위 라우트(`/challenge/{id}/diary` 등)는 깊이가 있어 back 버튼 유지.
  if (/^\/challenge\/\d+\/.+/.test(pathname)) {
    return true;
  }
  if (pathname === '/challenge/create') {
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

function readViewport(): Viewport {
  const width = window.innerWidth;
  if (width < 640) {
    return 'mobile';
  }
  if (width < 1024) {
    return 'tablet';
  }
  return 'desktop';
}

function subscribeViewport(callback: () => void): () => void {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
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

  const viewport = useSyncExternalStore<Viewport>(
    subscribeViewport,
    readViewport,
    () => 'desktop'
  );

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

  const showTopNav =
    !matchesRoute(pathname, TOP_NAV_HIDDEN_ROUTES) &&
    !(viewport !== 'desktop' && isTopNavBelowDesktopHidden(pathname)) &&
    !(viewport === 'mobile' && isTopNavMobileOnlyHidden(pathname));
  const showBackButton = needsBackButton(pathname);
  const isContentRouteForRail = !matchesRoute(
    pathname,
    RIGHT_RAIL_HIDDEN_ROUTES
  );
  const showRightRail = viewport === 'desktop' && isContentRouteForRail;
  const showBottomNav = viewport === 'mobile' && !isBottomNavHidden(pathname);
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
            mode={viewport}
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
          {showRightRail && hasMounted ? (
            <AppRightRail
              isLoggedIn={isLoggedIn}
              nickname={sidebarData?.nickname ?? '사용자'}
              handle={
                sidebarData?.nickname ? `@${sidebarData.nickname}` : undefined
              }
              profileImageUrl={sidebarData?.profileUrl}
              streakDays={sidebarData?.streakCount ?? 0}
              todayGoalCount={sidebarData?.todayGoalCount ?? 0}
              challenges={railChallenges}
              onChallengeClick={(id) => router.push(`/challenge/${id}`)}
            />
          ) : null}
        </div>

        {showBottomNav ? <AppBottomNav activeId={activeNavId} /> : null}
      </div>

      <BetaButton />
    </AppLayoutProvider>
  );
}
