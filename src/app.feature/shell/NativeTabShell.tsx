'use client';

import { ChallengeBoardSkeleton } from '@component/skeletons/ChallengeBoardSkeleton';
import { DiaryBoardSkeleton } from '@component/skeletons/DiaryBoardSkeleton';
import ChallengeBoardScreen from '@feature/challenge/board/screen/ChallengeBoardScreen';
import DiaryListScreen from '@feature/diary/board/screen/DiaryListScreen';
import ExploreScreen from '@feature/explore/screen/ExploreScreen';
import HomeMobileHeader from '@feature/home/components/HomeMobileHeader';
import HomeScreen from '@feature/home/screen/HomeScreen';
import MyPageScreen from '@feature/member/mypage/screen/MyPageScreen';
import React, { Suspense } from 'react';

/**
 * 네이티브 앱 전용 keep-alive 탭 셸.
 *
 * 지금까지 앱은 탭마다 WebView 를 하나씩(5개) 살려 두고 전환 때 show/hide
 * 했다. 전환은 즉시였지만 WebView 하나가 곧 렌더러 프로세스 하나라, 그
 * 5개가 그대로 상시 메모리였고 OOM 크래시의 뿌리였다.
 *
 * 이 셸은 **한 문서 안에** 탭 다섯을 전부 마운트해 두고 display 로만
 * 전환한다. 언마운트가 없으므로 컴포넌트 상태·React Query 캐시가 그대로
 * 남고, 재렌더·재fetch·스켈레톤 없이 즉시 전환된다 — 예전 6→1 시도가
 * 실패한 원인(라우트 전환 = 콜드 리마운트)이 여기엔 없다.
 *
 * 계약 (앱 ↔ 웹):
 *  - 앱 → 웹: CustomEvent('native:tab_change', { detail: { tab } })
 *    tab ∈ home | explore | challenge | diary | mypage
 *  - 웹 → 앱: 전환 후 history.replaceState 로 URL 을 실제 탭 경로(/, 
 *    /explore, …)로 바꾼다. Next 14+ 가 이를 usePathname 에 동기화하므로
 *    NativeBridge 의 nav_state 보고가 **그대로** 나간다 — 앱의 크롬 판정
 *    (RouteUtils)이 아무 변경 없이 동작한다.
 *
 * 스크롤: 문서 스크롤러를 그대로 쓴다(탭별 overflow 컨테이너로 바꾸면
 * 앱의 pull-to-refresh 감지가 죽는다 — 셸은 문서 러버밴딩을 잰다).
 * 대신 전환 때 scrollY 를 탭별로 저장해 두고 되돌린다. display 전환과
 * scrollTo 는 같은 프레임이라 사용자에게는 이어져 보인다.
 */

export type ShellTabId = 'home' | 'explore' | 'challenge' | 'diary' | 'mypage';

const TAB_PATHS: Record<ShellTabId, string> = {
  home: '/',
  explore: '/explore',
  challenge: '/challenge',
  diary: '/diary',
  mypage: '/mypage',
};

const TAB_IDS = Object.keys(TAB_PATHS) as ShellTabId[];

function isShellTabId(value: unknown): value is ShellTabId {
  return typeof value === 'string' && value in TAB_PATHS;
}

// 각 탭의 구성은 실제 page.tsx 와 같게 유지한다 — 셸이 별도 세계가 되면
// 페이지 쪽 수정이 셸에 반영되지 않는 빚이 생긴다. 구성이 바뀌면 여기도
// 함께 바꿀 것.
function TabPane({ tab }: { tab: ShellTabId }): React.ReactElement {
  switch (tab) {
    case 'home':
      return (
        <div className="flex min-h-screen w-full flex-col bg-white">
          <HomeMobileHeader />
          <Suspense fallback={null}>
            <HomeScreen />
          </Suspense>
        </div>
      );
    case 'explore':
      return <ExploreScreen />;
    case 'challenge':
      return (
        <Suspense fallback={<ChallengeBoardSkeleton />}>
          <ChallengeBoardScreen />
        </Suspense>
      );
    case 'diary':
      return (
        <Suspense fallback={<DiaryBoardSkeleton />}>
          <DiaryListScreen />
        </Suspense>
      );
    case 'mypage':
      return <MyPageScreen />;
    default:
      return <></>;
  }
}

export default function NativeTabShell({
  initialTab,
}: {
  initialTab: ShellTabId;
}): React.ReactElement {
  const [active, setActive] = React.useState<ShellTabId>(initialTab);
  // 한 번이라도 활성화된 탭만 마운트한다(이후 keep-alive).
  //
  // 처음부터 다섯을 다 마운트하면 숨은 탭의 효과도 전부 돈다 — 마이 탭의
  // 인증 가드가 게스트를 감지하고 문서를 /login 으로 라우팅해 셸을 통째로
  // 갈아치웠다(실측). 게스트는 마이 탭을 활성화할 수 없으므로(앱이
  // 네이티브에서 게이트) 첫 활성화 마운트면 그 문제가 원천에서 사라지고,
  // 초기 하이드레이션도 가벼워진다.
  const [mounted, setMounted] = React.useState<ShellTabId[]>([initialTab]);
  // 탭별 문서 스크롤 위치. 언마운트가 없으니 상태는 남지만 스크롤러는
  // 문서 하나를 공유한다 — 전환 때 저장/복원한다.
  const scrollByTab = React.useRef<Partial<Record<ShellTabId, number>>>({});
  const activeRef = React.useRef(active);
  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // URL 은 항상 /shell?tab=<탭> 으로 유지한다.
  //
  // 처음에는 실제 탭 경로(/, /diary …)로 replaceState 했는데, 그러면 이
  // 히스토리 엔트리 자체가 실제 라우트가 된다 — 상세로 push 했다가 back
  // 하는 순간 Next 가 그 엔트리의 라우트(실제 /diary 페이지)를 마운트해
  // **셸이 통째로 사라진다.** 탭 식별은 쿼리로 남기고, 앱이 이 URL 을
  // 실제 탭 경로로 번역해(onUrlChange) 크롬을 판정한다.
  React.useEffect(() => {
    window.history.replaceState(null, '', `/shell?tab=${initialTab}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const onTabChange = (event: Event): void => {
      const tab = (event as CustomEvent<{ tab?: unknown }>).detail?.tab;
      if (!isShellTabId(tab) || tab === activeRef.current) {
        return;
      }
      scrollByTab.current[activeRef.current] = window.scrollY;
      setMounted((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
      setActive(tab);
      window.history.replaceState(null, '', `/shell?tab=${tab}`);
      // display 가 바뀐 같은 프레임에 스크롤을 되돌린다. 새 탭이 아직
      // 그 높이만큼 콘텐츠가 없으면 브라우저가 알아서 최대치로 자른다.
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollByTab.current[tab] ?? 0);
      });
    };
    window.addEventListener('native:tab_change', onTabChange);
    return () => window.removeEventListener('native:tab_change', onTabChange);
  }, []);

  return (
    <>
      {TAB_IDS.filter((tab) => mounted.includes(tab)).map((tab) => (
        <div
          key={tab}
          data-shell-tab={tab}
          style={{ display: tab === active ? undefined : 'none' }}
        >
          <TabPane tab={tab} />
        </div>
      ))}
    </>
  );
}
