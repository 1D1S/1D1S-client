'use client';

import { PageWatermark } from '@1d1s/design-system';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import Stories from '@feature/stories/components/Stories';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
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

export default function HomeScreen(): React.ReactElement {
  const hasMounted = useHasMounted();
  const status = useAuthStatus();
  const isLoggedIn = status === 'authenticated';
  // 부팅 세션 확인 중(unknown)에는 게스트 CTA 대신 로그인 셸을 스켈레톤으로
  // 그린다. Safari standalone PWA 첫 진입에서 로그인 사용자가 게스트 CTA 를
  // 봤다가 로그인 UI 로 점프하던 깜빡임을 없앤다. 확정된 게스트만 CTA 를 본다.
  const showGuestCta = status === 'guest';
  const showLoggedInShell = !showGuestCta;
  const {
    data: sidebar,
    isLoading: isSidebarLoading,
    isFetching: isSidebarFetching,
  } = useSidebar();

  const streakDays = sidebar?.streakCount ?? 0;
  // 로그인 셸을 그리는 동안(확인 중 포함) sidebar 가 도착하기 전까지 스트릭
  // 스켈레톤을 노출해 0 → 실제 값 깜빡임을 막는다. `!hasMounted` 를 포함하는
  // 이유: SSR/하이드레이션 첫 페인트를 항상 skeleton 으로 고정해 서버/클라
  // 출력을 일치시키기 위함(hydration mismatch 방지).
  const isStreakLoading =
    showLoggedInShell &&
    (!hasMounted || isSidebarLoading || isSidebarFetching || !sidebar);

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

        {showLoggedInShell ? (
          <>
            <Stories isLoggedIn={showLoggedInShell} fetchEnabled={isLoggedIn} />

            {/* 배너/스트릭 — 모바일 세로 스택, lg 이상 1:1 좌우 배치 */}
            <div className="grid gap-3 lg:grid-cols-2">
              <HomeWarmBanner />
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
