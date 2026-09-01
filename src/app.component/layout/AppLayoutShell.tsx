'use client';

import { Button } from '@1d1s/design-system';
import { usePhoneNumberMissing } from '@feature/member/hooks/usePhoneNumberMissing';
import { useIsNativeApp } from '@module/hooks/useIsNativeApp';
import { useMarkReadFromDeepLink } from '@module/hooks/useMarkReadFromDeepLink';
import { useTokenRefreshOnResume } from '@module/hooks/useTokenRefreshOnResume';
import { buildLoginUrl } from '@module/utils/returnTo';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';

import AppBottomNav from './AppBottomNav';
import AppRightRail from './AppRightRail';
import AppTopNav from './AppTopNav';
import { useAuthLayoutState } from './useAuthLayoutState';

/**
 * 전역 셸에 매달려 있지만 첫 화면에 필요 없는 것들.
 *
 * 정적 import 면 조건이 false 인 라우트에서도 청크가 초기 번들에 들어간다
 * (모든 페이지가 투표 위젯·설치 유도·네이티브 브릿지 코드를 받고 있었다).
 * 렌더 조건과 로딩 조건을 맞춰, 필요한 화면에서만 내려받게 한다.
 *
 * ssr: false — 셋 다 클라이언트에서만 의미가 있고(브라우저 감지·설치 배너·
 * 네이티브 핸드셰이크) 초기 HTML 에 나올 필요가 없다.
 */
const AppInstallPrompt = dynamic(
  () =>
    import('@feature/install/components/AppInstallPrompt').then(
      (mod) => mod.AppInstallPrompt
    ),
  { ssr: false }
);

const VoteFloatingScreen = dynamic(
  () => import('@feature/vote/screen/VoteFloatingScreen'),
  { ssr: false }
);

const NativeBridge = dynamic(() => import('./NativeBridge'), { ssr: false });

const TOP_NAV_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
];

// 법적 고지 페이지는 읽고 나가는 문서다. 앱 탐색 동선이 필요 없어 상단
// 네비 없이 본문만 둔다(하단 네비는 원래 최상위 탭에만 뜬다). 대신 문서
// 끝에 서비스로 돌아가는 CTA 를 둬서 막다른 길이 되지 않게 한다.
//
// 가이드 글(/guide/*)은 여기 넣지 않는다 — 검색으로 들어온 사람을 앱으로
// 데려가는 입구라 네비가 그대로 필요하다.
const BARE_CHROME_ROUTES = ['/terms', '/privacy'];

// 홈(`/`)은 한때 본문이 스트릭·참여 중 챌린지·일지 쓰기를 직접 소유한다는
// 이유로 레일을 숨겼다. 그러나 모든 화면이 `max-w-[1200px] mx-auto` 라
// 레일 유무가 본문 중앙 정렬 기준을 바꿔, 홈↔챌린지 이동 시 본문이 가로로
// 튀었다(1920px 기준 약 140px). 레이아웃 일관성을 우선해 홈에도 레일을
// 노출하고, 스트릭·챌린지가 본문과 겹치는 것은 감수한다.
const RIGHT_RAIL_HIDDEN_ROUTES = [
  '/auth/login',
  '/login',
  '/auth/signup',
  '/signup',
  '/mypage',
  '/challenge/create',
  '/notification',
  // 채팅은 화면 높이를 꽉 쓰는 단일 패널이라 레일과 나란히 두면 좁아진다.
  '/chat',
  '/terms',
  '/privacy',
  '/install',
];

// 바텀 네비는 최상위 4개 탭에서만 노출한다. 그 외 서브/상세 화면은
// 각자 모바일 sticky 헤더(뒤로가기)를 사용하므로 바텀 네비를 숨긴다.
const BOTTOM_NAV_VISIBLE_ROUTES = [
  '/',
  '/explore',
  '/challenge',
  '/diary',
  '/mypage',
];

// 투표 플로팅 위젯 노출 경로. 전역으로 띄웠더니 일지·챌린지 상세의
// MobileBottomActionBar(댓글 입력 + 등록, CTA)와 같은 자리(우하단)에 겹쳐
// 등록 버튼을 가렸다 — 서브 화면은 바텀 네비가 없어 FAB 가 20px 까지
// 내려앉고, z-40 이라 z-20 인 액션바 위를 덮는다. 액션바는 각 화면이
// 직접 렌더해 셸이 존재를 알 수 없으므로, 셸이 아는 경로로 화이트리스트.
const VOTE_WIDGET_ROUTES = ['/', '/explore'];

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// 하위 경로를 제외한 정확 일치 판정(끝 슬래시만 정규화).
function matchesExactRoute(
  pathname: string,
  routes: readonly string[]
): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return routes.includes(normalized);
}

function isBottomNavVisible(pathname: string): boolean {
  // 정확히 최상위 탭 경로일 때만 노출(하위 경로는 서브 화면으로 간주).
  return matchesExactRoute(pathname, BOTTOM_NAV_VISIBLE_ROUTES);
}

function resolveActiveNavId(pathname: string): string {
  if (pathname.startsWith('/explore')) {
    return 'explore';
  }
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

  // 첫 판정은 RootLayout <head> 의 inline script 가 페인트 전에 끝낸다.
  // 이 effect 는 늦게 도착한 `native:ready` handshake 처럼 그 이후에
  // 값이 바뀌는 경우만 <html> 속성에 반영한다. RootLayout 은 App Router
  // 에서 재렌더되지 않으므로 이 effect 가 유일한 갱신 경로다.
  //
  // **false 는 절대 쓰지 않는다.** `useIsNativeApp` 은 useSyncExternalStore
  // 라서 하이드레이션 렌더에서는 계약상 getServerSnapshot(=false) 을
  // 돌려준다 — 그 커밋의 effect 가 'false' 를 쓰면 inline script 가 이미
  // 세워 둔 'true' 가 한 프레임 뒤집혀 웹 모바일 헤더가 보였다 사라진다
  // (탐색 첫 진입에서 가장 잘 보이던 그 반짝임). 곧바로 클라이언트
  // 스냅샷(true)으로 재렌더돼 다시 숨는 게 반짝임의 정체다.
  //
  // 네이티브가 아니면 SSR 값('false')이 그대로 맞으므로 쓸 일 자체가 없다.
  useEffect(() => {
    if (typeof document === 'undefined' || !isNativeApp) {
      return;
    }
    document.documentElement.dataset.nativeApp = 'true';
  }, [isNativeApp]);

  useTokenRefreshOnResume();
  useMarkReadFromDeepLink();

  // 인증/사이드바 상태는 별도 hook 으로 묶었다. shell 은 라우트 가시성 판단과
  // 핸들러 안정화에만 집중한다.
  const authState = useAuthLayoutState();
  const { isLoggedIn, isAuthLoading, sidebarData, railChallenges } = authState;

  // 전화번호 미입력 시 프로필 아바타에 경고 배지를 띄운다. 사이드바 응답에는
  // phoneNumber 가 없어 my-page 쿼리를 재사용한다(동일 queryKey dedupe).
  const showPhoneBadge = usePhoneNumberMissing();

  useEffect(() => {
    if (!isLoggedIn || !sidebarData) {
      return;
    }
    const onSignup = pathname === '/signup';
    if (!sidebarData.nickname) {
      // 추가정보 미완 → /signup. 이미 인증 라우트면 그대로 둔다.
      // /login 은 OAuth 콜백(/login/oauth2/…)까지 포함해 prefix 로 제외한다 —
      // 콜백이 returnTo 를 실어 보내는 replace 와 경합해 returnTo 가 유실됐다.
      if (
        !onSignup &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/auth')
      ) {
        router.replace('/signup');
      }
      return;
    }
    // 가입 완료(nickname 존재)인데 /signup 에 갇혀 있으면 홈으로 되돌린다.
    // 앱이 탭 WebView 를 살려 둔 채 전환하면, 가입 전 로드된 이 탭이 옛 판정으로
    // /signup 에 머문다. 전경 복귀 시 sidebar 가 refetch(위 refetchOnWindowFocus:
    // 'always')돼 최신 nickname 이 도착하면 이 역방향 가드가 즉시 빠져나가게 한다.
    // 가드는 nickname 이 있을 때만 발동하므로 가입 진행 중 사용자는 튕기지 않는다.
    if (onSignup) {
      router.replace('/');
    }
  }, [isLoggedIn, sidebarData, pathname, router]);

  const isLoginPage = matchesRoute(pathname, TOP_NAV_HIDDEN_ROUTES);
  // TopNav 가시성: 로그인/회원가입 페이지면 완전 제거. 네이티브 쉘 숨김은
  // BottomNav 와 같은 이유로 `native-hide` 클래스(CSS) 에 맡긴다.
  const isBareChromeRoute = matchesRoute(pathname, BARE_CHROME_ROUTES);
  const showTopNav = !isLoginPage && !isBareChromeRoute;
  // 모든 라우트에서 `lg`(1024px) 기준으로 데스크탑/태블릿 전환을 통일한다.
  // - 데스크탑(≥lg): 글로벌 TopNav 노출
  // - 태블릿/모바일(<lg): 글로벌 TopNav 숨김, BottomNav 노출
  //   (페이지별 자체 sticky 헤더가 있으면 화면 상단을 채운다)
  const topNavRespClass = 'hidden lg:flex native-hide';

  const showBackButton = needsBackButton(pathname);
  const isContentRouteForRail = !matchesRoute(
    pathname,
    RIGHT_RAIL_HIDDEN_ROUTES
  );
  const showRightRail = isContentRouteForRail;
  // 바텀 네비는 네이티브에서도 마운트하되 CSS(`native-hide`) 로 가린다.
  // isNativeApp 으로 언마운트하면 서버 HTML → 하이드레이션 사이에 한 번
  // 그려졌다 사라져 본문이 위로 튄다. 가시성 판단은 inline script 가
  // 세팅한 `data-native-app` 이 첫 페인트 전에 끝낸다.
  // ponytail: 네이티브에서도 훅(라우트 prefetch) 은 그대로 돈다.
  const showBottomNav = isBottomNavVisible(pathname);
  const isVoteWidgetRoute = matchesExactRoute(pathname, VOTE_WIDGET_ROUTES);
  const bottomNavRespClass = 'lg:hidden native-hide';
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      {showTopNav ? (
        <AppTopNav
          activeId={activeNavId}
          isLoggedIn={isLoggedIn}
          isAuthLoading={isAuthLoading}
          streakDays={sidebarData?.streakCount ?? 0}
          profileImageUrl={sidebarData?.profileUrl}
          showPhoneBadge={showPhoneBadge}
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
          <div className="hidden lg:flex">
            <AppRightRail
              isLoggedIn={isLoggedIn}
              isAuthLoading={isAuthLoading}
              nickname={sidebarData?.nickname ?? '사용자'}
              handle={
                sidebarData?.nickname ? `@${sidebarData.nickname}` : undefined
              }
              profileImageUrl={sidebarData?.profileUrl}
              showPhoneBadge={showPhoneBadge}
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

      {/* 모바일 웹으로 들어온 사용자에게만 앱을 권한다. 스스로 데스크톱·
          네이티브 웹뷰·홈 화면 PWA 를 걸러내므로 여기서는 조건을 겹치지
          않는다(가시성 규칙이 두 곳에 흩어지면 한쪽만 바뀐다). */}
      <AppInstallPrompt isNativeApp={isNativeAppFromServer} />
      {/* enabled 를 내부에서 보던 것을 바깥으로 올렸다. dynamic 은 렌더될 때
          청크를 받으므로, 조건을 안쪽에 두면 꺼진 라우트에서도 내려받는다. */}
      {isLoggedIn && !isLoginPage && isVoteWidgetRoute ? (
        <VoteFloatingScreen
          enabled
          hasBottomNav={showBottomNav && !isNativeApp}
          hasRightRail={showRightRail}
        />
      ) : null}
      {isNativeApp ? <NativeBridge authState={authState} /> : null}
    </div>
  );
}
