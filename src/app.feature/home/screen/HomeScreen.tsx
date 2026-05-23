'use client';

import { PageWatermark } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import Stories from '@feature/stories/components/Stories';
import { useHasMounted } from '@module/hooks/useHasMounted';
import { cn } from '@module/utils/cn';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import HomeNoticeStrip from '../components/HomeNoticeStrip';
import HomeQuickActions from '../components/HomeQuickActions';
import HomeRandomChallengesSection from '../components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '../components/HomeRandomDiariesSection';
import HomeStreakSlot from '../components/HomeStreakSlot';
import HomeWarmBanner from '../components/HomeWarmBanner';
import HomeWarmGreeting from '../components/HomeWarmGreeting';
import { useHomeRandomData } from '../hooks/useHomeRandomData';
import { useHomeRandomDiaryLike } from '../hooks/useHomeRandomDiaryLike';

interface HomeScreenProps {
  /** 서버에서 쿠키로 평가한 로그인 힌트. SSR/하이드레이션 직후 비로그인 UI 가
   *  잠깐 그려졌다가 로그인 UI 로 점프하는 시프트를 막기 위한 초기값. */
  initialHasAuthHint?: boolean;
}

export default function HomeScreen({
  initialHasAuthHint = false,
}: HomeScreenProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
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

  const handleDialogOpenChange = useCallback(
    (open: boolean): void => {
      setShowLoginDialog(open);
      if (!open && isLoginRequired) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('loginRequired');
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      }
    },
    [setShowLoginDialog, isLoginRequired, searchParams, router, pathname]
  );

  const handleMoreChallenges = useCallback(
    () => router.push('/challenge'),
    [router]
  );

  const handleChallengeClick = useCallback(
    (challengeId: number): void => {
      if (!isLoggedIn) {
        setShowLoginDialog(true);
        return;
      }
      router.push(`/challenge/${challengeId}`);
    },
    [isLoggedIn, setShowLoginDialog, router]
  );

  const handleMoreDiaries = useCallback(
    () => router.push('/diary'),
    [router]
  );

  const handleDiaryClick = useCallback(
    (diaryId: number): void => {
      if (!isLoggedIn) {
        setShowLoginDialog(true);
        return;
      }
      router.push(`/diary/${diaryId}`);
    },
    [isLoggedIn, setShowLoginDialog, router]
  );

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
  // 토큰 힌트는 있는데 sidebar 가 아직 도착하지 않은 구간에서 0 → 실제 값으로
  // 깜빡이는 것을 막기 위해 스켈레톤을 노출.
  const isStreakLoading =
    isLoggedIn && (isSidebarLoading || isSidebarFetching || !sidebar);
  // 스토리 스켈레톤이 늦게 뜨지 않도록, "로그인 확정" 외에도
  // sidebar 인증 판정이 진행 중이면 stories 쿼리를 선제 활성화한다.
  const isStoriesEnabled =
    isLoggedIn ||
    isSidebarLoading ||
    isSidebarFetching ||
    (!hasMounted && initialHasAuthHint);

  return (
    <>
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
        {/* 친구들의 일지 스토리 — 비로그인 시 로그인 유도 슬롯 노출 */}
        <div className="-mx-5 lg:-mx-8">
          <Stories
            isLoggedIn={isLoggedIn}
            fetchEnabled={isStoriesEnabled}
            onRequireLogin={() => setShowLoginDialog(true)}
          />
        </div>

        {/* 모바일 인사 hero — 데스크탑/태블릿은 시안에 따라 생략 */}
        <div className="lg:hidden">
          <HomeWarmGreeting />
        </div>

        {/* 모바일/태블릿: 스트릭 슬롯을 배너 위로 올림 */}
        <div className="lg:hidden">
          <HomeStreakSlot
            isLoggedIn={isLoggedIn}
            streakDays={streakDays}
            isStreakLoading={isStreakLoading}
          />
        </div>

        {/* Banner + StreakHero row (lg부터 1:1 좌우, 그 이하에선 위쪽 슬롯 사용) */}
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
          <HomeWarmBanner />
          <div className="hidden lg:block">
            <HomeStreakSlot
              isLoggedIn={isLoggedIn}
              streakDays={streakDays}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <HomeNoticeStrip />
          <HomeQuickActions />
        </div>

        <HomeRandomChallengesSection
          challenges={randomChallenges}
          isLoading={isChallengesLoading}
          isError={isChallengesError}
          errorMessage={challengesErrorMessage}
          onMoreClick={handleMoreChallenges}
          onChallengeClick={handleChallengeClick}
        />

        <HomeRandomDiariesSection
          diaries={randomDiaries}
          isLoading={isDiariesLoading}
          isError={isDiariesError}
          errorMessage={diariesErrorMessage}
          isLikePending={isLikePending}
          onMoreClick={handleMoreDiaries}
          onDiaryClick={handleDiaryClick}
          onLikeToggle={onLikeToggle}
        />

        <div className="flex w-full justify-center pt-4">
          <PageWatermark />
        </div>
      </div>
    </>
  );
}
