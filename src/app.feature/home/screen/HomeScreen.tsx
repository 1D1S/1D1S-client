'use client';

import { PageWatermark } from '@1d1s/design-system';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import Stories from '@feature/stories/components/Stories';
import { useHasMounted } from '@module/hooks/useHasMounted';
import { cn } from '@module/utils/cn';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useRouter } from 'next/navigation';
import React from 'react';

import HomeExploreEntry from '../components/HomeExploreEntry';
import HomePopup from '../components/HomePopup';
import HomeStreakSlot from '../components/HomeStreakSlot';
import HomeTodayRecordSection from '../components/HomeTodayRecordSection';
import HomeWarmBanner from '../components/HomeWarmBanner';
import HomeWarmGreeting from '../components/HomeWarmGreeting';

interface HomeScreenProps {
  /** 서버에서 쿠키로 평가한 로그인 힌트. SSR/하이드레이션 직후 비로그인 UI 가
   *  잠깐 그려졌다가 로그인 UI 로 점프하는 시프트를 막기 위한 초기값. */
  initialHasAuthHint?: boolean;
}

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
        <span aria-hidden className="animate-flame-flicker text-[40px]">
          🔥
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

export default function HomeScreen({
  initialHasAuthHint = false,
}: HomeScreenProps): React.ReactElement {
  const hasMounted = useHasMounted();
  const isLoggedInClient = useIsLoggedIn();
  // SSR 및 하이드레이션 직후엔 서버 힌트를, mount 이후엔 권위 있는 클라이언트
  // 판정을 사용한다. 두 값이 일치하지 않을 때만 1회 전환이 발생한다.
  const isLoggedIn = hasMounted ? isLoggedInClient : initialHasAuthHint;
  const {
    data: sidebar,
    isLoading: isSidebarLoading,
    isFetching: isSidebarFetching,
  } = useSidebar();

  const streakDays = sidebar?.streakCount ?? 0;
  // 토큰 힌트는 있는데 sidebar 가 아직 도착하지 않은 구간에서 0 → 실제 값으로
  // 깜빡이는 것을 막기 위해 스켈레톤을 노출.
  //
  // `!hasMounted` 를 포함하는 이유: SSR/하이드레이션 첫 페인트에서 sidebar 쿼리
  // 결과가 서버(미도착 → skeleton)와 클라이언트(dehydrate 캐시 → 데이터)로
  // 갈려 hydration mismatch 가 발생했다. mount 전에는 항상 skeleton 으로 고정해
  // 서버/클라 첫 출력을 일치시키고, 실제 값(streakDays)은 mount 이후에만 렌더한다.
  const isStreakLoading =
    isLoggedIn &&
    (!hasMounted || isSidebarLoading || isSidebarFetching || !sidebar);
  // 스토리 스켈레톤이 늦게 뜨지 않도록, "로그인 확정" 외에도
  // sidebar 인증 판정이 진행 중이면 stories 쿼리를 선제 활성화한다.
  const isStoriesEnabled =
    isLoggedIn ||
    isSidebarLoading ||
    isSidebarFetching ||
    (!hasMounted && initialHasAuthHint);

  return (
    <>
      <HomePopup enabled={isLoggedIn} />
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1200px] flex-col gap-4 lg:gap-6',
          'px-5 py-7 lg:px-8 lg:py-10'
        )}
      >
        {/* 모바일 인사 hero — 데스크탑/태블릿은 시안에 따라 생략.
            인사~스토리 간격이 과해 보여 모바일에서만 gap 을 좁힌다. */}
        <div className="-mb-2 lg:mb-0 lg:hidden">
          <HomeWarmGreeting />
        </div>

        {isLoggedIn ? (
          <>
            <Stories isLoggedIn={isLoggedIn} fetchEnabled={isStoriesEnabled} />

            {/* 배너/스트릭 — 모바일 세로 스택, lg 이상 1:1 좌우 배치 */}
            <div className="grid gap-3 lg:grid-cols-2">
              <HomeWarmBanner />
              <HomeStreakSlot
                streakDays={streakDays}
                isStreakLoading={isStreakLoading}
              />
            </div>

            <HomeTodayRecordSection
              challenges={sidebar?.challengeList ?? []}
              isAuthLoading={isStreakLoading}
            />
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
