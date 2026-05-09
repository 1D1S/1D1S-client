'use client';

import { PageWatermark } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import HomeQuickActions from '../components/HomeQuickActions';
import HomeRandomChallengesSection from '../components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '../components/HomeRandomDiariesSection';
import HomeStreakSlot from '../components/HomeStreakSlot';
import HomeWarmBanner from '../components/HomeWarmBanner';
import HomeWarmGreeting from '../components/HomeWarmGreeting';
import { useHomeRandomData } from '../hooks/useHomeRandomData';
import { useHomeRandomDiaryLike } from '../hooks/useHomeRandomDiaryLike';

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
  const isLoggedIn = useIsLoggedIn();
  const { data: sidebar } = useSidebar();
  const { isLikePending, showLoginDialog, setShowLoginDialog, onLikeToggle } =
    useHomeRandomDiaryLike();
  const loginDialogDescription = isLoginRequired
    ? '로그인 후 이용할 수 있습니다.'
    : undefined;

  // `?loginRequired=true` 진입 시 비로그인 사용자에게만 다이얼로그를 1회 띄운다.
  // mount-only useEffect 는 hydration 직후 isLoggedIn 이 일시적으로 false 인 구간을
  // 잡아 잘못된 다이얼로그를 띄울 수 있어, prevState 패턴으로 변경 시점에만 반응한다.
  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
    }
  }

  const handleDialogOpenChange = (open: boolean): void => {
    setShowLoginDialog(open);
    if (!open && isLoginRequired) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('loginRequired');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  };

  const {
    randomChallenges,
    isChallengesLoading,
    isChallengesError,
    challengesErrorMessage,
    randomDiaries,
    isDiariesLoading,
    isDiariesError,
    diariesErrorMessage,
  } = useHomeRandomData();

  const streakDays = sidebar?.streakCount ?? 0;
  const todayGoalCount = sidebar?.todayGoalCount ?? 0;

  return (
    <div
      className={cn(
        'flex min-h-screen w-full flex-col',
        'from-main-100 bg-gradient-to-b via-white to-white'
      )}
    >
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={handleDialogOpenChange}
        description={loginDialogDescription}
      />
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1200px] flex-col gap-7',
          'px-5 py-7 lg:px-8 lg:py-10'
        )}
      >
        {/* 모바일 인사 hero — 데스크탑/태블릿은 시안에 따라 생략 */}
        <div className="lg:hidden">
          <HomeWarmGreeting />
        </div>

        {/* Banner + StreakHero row (데스크탑은 1:1, 태블릿은 1.4:1, 모바일은 1열) */}
        <div
          className={cn(
            'grid gap-3 sm:grid-cols-[1.4fr_1fr] lg:grid-cols-2',
            'lg:gap-5'
          )}
        >
          <HomeWarmBanner />
          <div className="hidden sm:block">
            <HomeStreakSlot
              isLoggedIn={isLoggedIn}
              streakDays={streakDays}
              todayGoalCount={todayGoalCount}
            />
          </div>
        </div>

        <HomeQuickActions />

        <HomeRandomChallengesSection
          challenges={randomChallenges}
          isLoading={isChallengesLoading}
          isError={isChallengesError}
          errorMessage={challengesErrorMessage}
          onMoreClick={() => router.push('/challenge')}
          onChallengeClick={(challengeId) => {
            if (!isLoggedIn) {
              setShowLoginDialog(true);
              return;
            }
            router.push(`/challenge/${challengeId}`);
          }}
        />

        <HomeRandomDiariesSection
          diaries={randomDiaries}
          isLoading={isDiariesLoading}
          isError={isDiariesError}
          errorMessage={diariesErrorMessage}
          isLikePending={isLikePending}
          onMoreClick={() => router.push('/diary')}
          onDiaryClick={(diaryId) => {
            if (!isLoggedIn) {
              setShowLoginDialog(true);
              return;
            }
            router.push(`/diary/${diaryId}`);
          }}
          onLikeToggle={onLikeToggle}
        />

        <div className="flex w-full justify-center pt-4">
          <PageWatermark />
        </div>
      </div>
    </div>
  );
}
