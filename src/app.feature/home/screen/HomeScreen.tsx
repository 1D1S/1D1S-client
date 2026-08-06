'use client';

import { Icon, PageWatermark } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import StoryRingSkeleton from '@feature/stories/components/StoryRingSkeleton';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { useHasMounted } from '@module/hooks/useHasMounted';
import { useSignalAppReady } from '@module/hooks/useSignalAppReady';
import { authStorage } from '@module/utils/auth';
import { cn } from '@module/utils/cn';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React from 'react';

import HomeExploreEntry from '../components/HomeExploreEntry';
import HomeStreakSlot from '../components/HomeStreakSlot';
import HomeTodayRecordSection from '../components/HomeTodayRecordSection';
import HomeWarmBanner from '../components/HomeWarmBanner';
import HomeWarmGreeting from '../components/HomeWarmGreeting';

// 아래-폴드 섹션은 dynamic import 로 지연한다. 홈 첫 페인트 크리티컬 청크에서
// Stories(StoryRing/Viewer)·HomePopup 코드를 빼 파싱을 줄이고, 이들이 첫 페인트
// 후 마운트될 때만 각자의 쿼리(스토리·팝업)가 발화해 크리티컬 sidebar/auth
// 쿼리와 대역폭을 다투지 않게 한다. app_ready 는 sidebar 로만 게이팅되므로 이
// 지연이 스플래시 시점을 늦추지 않는다.
const Stories = dynamic(() => import('@feature/stories/components/Stories'), {
  ssr: false,
  loading: () => <StoryRingSkeleton />,
});
const HomePopup = dynamic(() => import('../components/HomePopup'), {
  ssr: false,
});

function HomeLoginCta(): React.ReactElement {
  const router = useRouter();
  return (
    <section className="w-full">
      <button
        type="button"
        onClick={() => router.push(loginUrlFromCurrentLocation())}
        aria-label="로그인하고 나의 오늘 시작하기"
        className={cn(
          'flex min-h-[280px] w-full flex-col items-center justify-center',
          'rounded-4 border-main-200 gap-3 border p-8 text-center',
          'from-main-100 via-main-200/40 to-main-200 bg-gradient-to-br',
          'cursor-pointer transition hover:brightness-105'
        )}
      >
        <span
          aria-hidden
          className="animate-flame-flicker inline-flex text-red-500"
        >
          <Icon name="Flame" size={40} />
        </span>
        <span className="text-[18px] font-extrabold tracking-tight text-gray-900">
          로그인하고 나의 오늘을 시작하세요
        </span>
        <span className="text-[13px] text-gray-600">
          스트릭·오늘의 기록·스토리를 한곳에서 이어가요.
        </span>
        <span
          className={cn(
            'mt-1 inline-flex items-center rounded-full',
            'bg-brand px-4 py-2 text-[13px] font-bold text-white'
          )}
        >
          로그인하기 →
        </span>
      </button>
    </section>
  );
}

export default function HomeScreen(): React.ReactElement {
  const hasMounted = useHasMounted();
  const status = useAuthStatus();
  const isLoggedIn = status === 'authenticated';
  // 로그인 힌트(hasTokens)는 확인 중(unknown) 구간에 "어느 스켈레톤을 보여줄지"
  // 만 고르는 provisional 신호다. 권위 있는 판정은 여전히 status(서버 확인)이며
  // 힌트로 로그인 여부를 확정하지 않는다(tri-state 원칙 유지).
  // - 마운트 전(SSR/하이드레이션): 힌트를 못 읽어 로그인 셸을 기본값으로 둔다
  //   (기존과 동일 → hydration mismatch 방지).
  // - 확인 중 + 힌트 있음: 로그인 셸 스켈레톤 유지 → Safari PWA 로그인 사용자의
  //   게스트→로그인 점프 깜빡임 방지(#207).
  // - 확인 중 + 힌트 없음(=일반 게스트): 게스트 CTA 를 바로 보여줘 로그인용
  //   스켈레톤이 뜨지 않게 한다.
  const hasAuthHint = hasMounted && authStorage.hasTokens();
  const showGuestCta =
    status === 'guest' || (status === 'unknown' && hasMounted && !hasAuthHint);
  const showLoggedInShell = !showGuestCta;
  const { data: sidebar, isLoading: isSidebarLoading } = useSidebar();

  const streakDays = sidebar?.streakCount ?? 0;
  // 스켈레톤은 "캐시된 데이터가 아직 없는 최초 로드"에만 노출한다.
  // 예전엔 isFetching 을 포함해, 뮤테이션 후 invalidate·webview resume 등
  // 배경 refetch 때마다 스켈레톤이 다시 떠 레이아웃 시프트가 났다. isLoading
  // (v5: 데이터 없음 + fetching) + !sidebar 만 보면 배경 refetch 중에는
  // 기존 캐시를 유지해 시프트가 없다. `!hasMounted` 는 SSR/하이드레이션 첫
  // 페인트를 skeleton 으로 고정해 hydration mismatch 를 막기 위함(초기 한정).
  const isStreakLoading =
    showLoggedInShell && (!hasMounted || isSidebarLoading || !sidebar);

  // 스플래시 dismiss 신호: 홈 핵심 콘텐츠(스트릭/오늘의 기록 or 게스트 CTA)가
  // 스켈레톤이 아니라 실제로 렌더된 시점에 1회 발화. 게스트는 isStreakLoading
  // 이 false 라 CTA 렌더 직후, 로그인 사용자는 사이드바 로드 후.
  // `unknown`(부팅 세션 확인 중)에는 보내지 않는다. 힌트가 없는 순간에는
  // showGuestCta 가 true → isStreakLoading 이 false 라, 로그인 사용자인데도
  // 게스트 CTA 를 그린 채 곧바로 신호가 나갔다. 네이티브 셸은 그걸 "홈 완성"
  // 으로 보고 스플래시를 걷고, 그 직후 auth 가 확정되며 홈이 통째로 다시
  // 그려진다 — "다 로딩되기 전에 스플래시가 걷힌다"의 정체(안드로이드에서
  // 확인 왕복이 더 길어 특히 눈에 띄었다).
  useSignalAppReady(status !== 'unknown' && !isStreakLoading);

  return (
    <>
      <HomePopup enabled={isLoggedIn} />
      <div
        data-native-home-content
        className={cn(
          'mx-auto flex w-full max-w-[1200px] flex-col gap-4 lg:gap-6',
          'px-5 py-7 lg:px-8 lg:py-10'
        )}
      >
        {/* 모바일 인사 hero — 데스크탑/태블릿은 시안에 따라 생략.
            인사~스토리 간격이 과해 보여 모바일에서만 gap 을 좁힌다. */}
        <div className="-mb-2 lg:mb-0 lg:hidden">
          <HomeWarmGreeting isLoading={showLoggedInShell && isStreakLoading} />
        </div>

        {showLoggedInShell ? (
          <>
            <Stories isLoggedIn={showLoggedInShell} fetchEnabled={isLoggedIn} />

            {/* 배너/스트릭 — 모바일 세로 스택, lg 이상 1:1 좌우 배치 */}
            <div className="grid gap-3 lg:grid-cols-2">
              <HomeWarmBanner isLoading={isStreakLoading} />
              <HomeStreakSlot
                streakDays={streakDays}
                isStreakLoading={isStreakLoading}
              />
            </div>

            {/* 배너/스트릭과 오늘의 기록 사이만 살짝 더 띄운다. */}
            <div className="mt-2 lg:mt-3">
              <HomeTodayRecordSection
                challenges={sidebar?.challengeList ?? []}
                isAuthLoading={isStreakLoading}
              />
            </div>
          </>
        ) : (
          <>
            <HomeLoginCta />
            <HomeWarmBanner />
          </>
        )}

        {/* 탐색 유도 진입점 — 홈 하단 */}
        <HomeExploreEntry />

        <div className="flex w-full justify-center pt-4">
          <PageWatermark />
        </div>
      </div>
    </>
  );
}
