'use client';

import {
  AppHeader,
  Button,
  RightSidebar,
  type RightSidebarChallenge,
  type RightSidebarProps,
} from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { authStorage } from '@module/utils/auth';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { BetaButton } from '../BetaButton';
import { AppLayoutProvider } from './AppLayoutContext';

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

const APP_HEADER_NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'explore', label: '챌린지' },
  { key: 'community', label: '일지' },
] as const;

const APP_HEADER_ROUTE_BY_KEY: Record<string, string> = {
  home: '/',
  explore: '/challenge',
  community: '/diary',
};

const DEFAULT_RIGHT_SIDEBAR_PROPS: RightSidebarProps = {
  userName: '사용자',
  userSubtitle: '로그인이 필요한 서비스입니다.',
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

/**
 * 패널 사이드바 없이 헤더 프로필 → 오버레이 방식을 사용하는 경로.
 * 이 경로에서는 데스크톱 너비여도 오버레이를 자동으로 닫지 않습니다.
 *
 * 추가 방법:
 *   - 고정 경로: OVERLAY_SIDEBAR_ROUTES 배열에 추가
 *   - 동적 경로: isOverlaySidebarRoute 함수 내 조건 추가 (예: isDiaryDetailRoute)
 */
const OVERLAY_SIDEBAR_ROUTES: readonly string[] = [
  // 예: '/diary/' 형태의 일지 상세는 추후 아래에 추가
];

function needsBackButton(pathname: string): boolean {
  if (isChallengeDetailRoute(pathname)) {
    return true;
  }
  if (pathname === '/challenge/create') {
    return true;
  }
  if (/^\/diary\/\d+/.test(pathname)) {
    return true;
  }
  if (pathname === '/diary/create') {
    return true;
  }
  if (pathname === '/mypage/settings') {
    return true;
  }
  if (pathname === '/notification') {
    return true;
  }
  if (pathname === '/onboarding') {
    return true;
  }
  return false;
}

function isOverlaySidebarRoute(pathname: string): boolean {
  return (
    isChallengeDetailRoute(pathname) ||
    matchesRoute(pathname, OVERLAY_SIDEBAR_ROUTES)
  );
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
  const now = useSyncExternalStore(NOOP_SUBSCRIBE, getMountTimestamp, () => 0);

  const hasTokenHint = hasMounted && authStorage.hasTokens();
  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth < 1024,
    () => true
  );
  const [isSidebarOverlayOpen, setIsSidebarOverlayOpen] = useState(false);
  const [isSidebarOverlayMounted, setIsSidebarOverlayMounted] = useState(false);
  const sidebarOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSidebarOverlayOpen) {
      const timerId = window.setTimeout(
        () => setIsSidebarOverlayMounted(true),
        0
      );
      return () => window.clearTimeout(timerId);
    }
    const timerId = window.setTimeout(
      () => setIsSidebarOverlayMounted(false),
      200
    );
    return () => window.clearTimeout(timerId);
  }, [isSidebarOverlayOpen]);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsSidebarOverlayOpen(false), 0);
    return () => window.clearTimeout(timerId);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile && isSidebarOverlayOpen && !isOverlaySidebarRoute(pathname)) {
      const timerId = window.setTimeout(() => {
        setIsSidebarOverlayOpen(false);
      }, 0);
      return () => window.clearTimeout(timerId);
    }
    return undefined;
  }, [isMobile, isSidebarOverlayOpen, pathname]);

  useEffect(() => {
    if (!isSidebarOverlayOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        sidebarOverlayRef.current &&
        !sidebarOverlayRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOverlayOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsSidebarOverlayOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOverlayOpen]);
  const {
    data: sidebarData,
    isLoading: isSidebarLoading,
    isFetching: isSidebarFetching,
  } = useSidebar();
  /**
   * 실제 로그인 상태 판정 (`useIsLoggedIn`과 동일 규칙):
   * - 토큰 힌트가 없으면 항상 비로그인.
   * - 힌트 위에서 sidebarData가 있거나 아직 fetching 중이면 잠정 로그인.
   * - 로그아웃 시 힌트가 먼저 제거되므로 캐시된 sidebarData만으로 로그인 오판 방지.
   */
  const isLoggedIn = hasMounted && hasTokenHint && (
    Boolean(sidebarData) || isSidebarLoading || isSidebarFetching
  );
  const isSidebarBusy = hasTokenHint && (isSidebarLoading || isSidebarFetching);

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

  const sidebarProps: RightSidebarProps = useMemo(() => {
    if (!sidebarData || !isLoggedIn) {
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
      userSubtitle: `오늘의 목표 ${sidebarData.todayGoalCount}개`,
      userImage: sidebarData.profileUrl,
      streakDays: sidebarData.streakCount,
      challenges,
    };
  }, [sidebarData, isLoggedIn, now]);
  const showHeader = !matchesRoute(pathname, HEADER_HIDDEN_ROUTES);
  const showBackButton = needsBackButton(pathname);
  const showRightSidebar =
    !matchesRoute(pathname, RIGHT_SIDEBAR_HIDDEN_ROUTES) &&
    !isChallengeDetailRoute(pathname);
  const activeNavKey = resolveActiveNavKey(pathname);
  const sidebarStickyTopClass = showHeader ? 'top-28' : 'top-6';
  const handleSidebarChallengeClick = (
    challenge: RightSidebarChallenge
  ): void => {
    if (!challenge.id) {
      return;
    }
    setIsSidebarOverlayOpen(false);
    router.push(`/challenge/${challenge.id}`);
  };

  return (
    <AppLayoutProvider
      value={{
        hasRightSidebar: showRightSidebar,
        isRightSidebarCollapsed: false,
      }}
    >
      <div className="flex min-h-screen w-full flex-col bg-white">
        {showHeader ? (
          <header className="sticky top-0 z-30 shrink-0 bg-white px-4 pt-3">
            <AppHeader
              navItems={[...APP_HEADER_NAV_ITEMS]}
              activeKey={activeNavKey}
              showProfile={
                (isMobile || (isLoggedIn && !showRightSidebar)) &&
                pathname !== '/mypage'
              }
              profileImage={
                isLoggedIn
                  ? sidebarProps.userImage || '/images/default-profile.png'
                  : undefined
              }
              onLogoClick={() => router.push('/')}
              onNavChange={(key) => {
                const route = APP_HEADER_ROUTE_BY_KEY[key];
                if (route) {
                  router.push(route);
                }
              }}
              showBackButton={showBackButton && isMobile}
              onBackClick={() => router.back()}
              onNotificationClick={() => router.push('/notification')}
              onProfileClick={() => {
                if (!isLoggedIn) {
                  router.push('/login');
                  return;
                }
                setIsSidebarOverlayOpen(true);
              }}
            />
          </header>
        ) : null}

        {showBackButton && (
          <div className="hidden shrink-0 px-6 pt-3 lg:flex">
            <Button variant="ghost" size="small" onClick={() => router.back()}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              뒤로가기
            </Button>
          </div>
        )}

        {showRightSidebar ? (
          <div className="flex min-h-0 flex-1 gap-4">
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden">
              {children}
            </main>

            {/* 데스크톱 사이드바 */}
            <aside
              className={cn(
                'sticky hidden h-fit min-h-0 shrink-0 self-start pt-3 pr-3 lg:block',
                sidebarStickyTopClass,
              )}
            >
              {hasMounted ? (
                <RightSidebar
                  {...sidebarProps}
                  isLoggedIn={isLoggedIn}
                  isLoading={isSidebarBusy}
                  fixed={false}
                  onWriteDiary={() => router.push('/diary/create')}
                  onGoMyPage={() => router.push('/mypage')}
                  onOpenSettings={() => router.push('/mypage/settings')}
                  onLogin={() => router.push('/login')}
                  onJoinChallenge={() => router.push('/challenge')}
                  onCreateChallenge={() => router.push('/challenge/create')}
                  onChallengeClick={handleSidebarChallengeClick}
                />
              ) : (
                <div className="w-69" />
              )}
            </aside>
          </div>
        ) : (
          <main className="min-h-0 min-w-0 flex-1">{children}</main>
        )}

        {/* 사이드바 오버레이 (모바일 + 프로필 클릭 공통) */}
        {isSidebarOverlayMounted && hasMounted ? (
          <div
            ref={sidebarOverlayRef}
            className={cn(
              'fixed top-4 right-3 z-50 transition-opacity duration-200',
              isSidebarOverlayOpen ? 'opacity-100' : 'opacity-0',
            )}
          >
            <RightSidebar
              {...sidebarProps}
              isLoggedIn={isLoggedIn}
              isLoading={isSidebarBusy}
              fixed={false}
              onCollapseClick={() => setIsSidebarOverlayOpen(false)}
              onWriteDiary={() => router.push('/diary/create')}
              onGoMyPage={() => router.push('/mypage')}
              onOpenSettings={() => router.push('/mypage/settings')}
              onLogin={() => router.push('/login')}
              onJoinChallenge={() => router.push('/challenge')}
              onCreateChallenge={() => router.push('/challenge/create')}
              onChallengeClick={handleSidebarChallengeClick}
            />
          </div>
        ) : null}
      </div>

      <BetaButton />
    </AppLayoutProvider>
  );
}
