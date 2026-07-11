'use client';

import { PageWatermark } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSidebar } from '@feature/member/hooks/useMemberQueries';
import { useHasMounted } from '@module/hooks/useHasMounted';
import { cn } from '@module/utils/cn';
import { RETURN_TO_PARAM, sanitizeReturnTo } from '@module/utils/returnTo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import HomeMineSection from '../components/HomeMineSection';
import HomeNoticeStrip from '../components/HomeNoticeStrip';
import HomePopup from '../components/HomePopup';
import HomeQuickActions from '../components/HomeQuickActions';
import HomeRandomChallengesSection from '../components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '../components/HomeRandomDiariesSection';
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
  const { showLoginDialog, setShowLoginDialog, onLikeToggle } =
    useHomeRandomDiaryLike();
  const loginDialogDescription = isLoginRequired
    ? '로그인 후 이용할 수 있습니다.'
    : undefined;

  // `?loginRequired=true` 진입 시 비로그인 사용자에게만 다이얼로그를 1회 띄운다.
  // mount-only useEffect 는 hydration 직후 isLoggedIn 이 일시적으로 false 인 구간을
  // 잡아 잘못된 다이얼로그를 띄울 수 있어, prevState 패턴으로 변경 시점에만 반응한다.
  // 바운스 시 원래 가려던 경로. 로그인 후 그리로 복귀한다.
  const [loginReturnTo, setLoginReturnTo] = useState<string | null>(null);
  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoginReturnTo(sanitizeReturnTo(searchParams.get(RETURN_TO_PARAM)));
    }
  }

  const handleDialogOpenChange = useCallback(
    (open: boolean): void => {
      setShowLoginDialog(open);
      if (!open) {
        setLoginReturnTo(null);
      }
      if (!open && isLoginRequired) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('loginRequired');
        params.delete(RETURN_TO_PARAM);
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

  const handleMoreDiaries = useCallback(() => router.push('/diary'), [router]);

  // 로그인 시 카드 자체가 Link(prefetch)로 동작하므로, 여기서는 비로그인
  // 클릭에 대한 로그인 유도만 담당한다.
  const handleRequireLogin = useCallback(
    () => setShowLoginDialog(true),
    [setShowLoginDialog]
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
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={handleDialogOpenChange}
        description={loginDialogDescription}
        returnTo={loginReturnTo}
      />
      <HomePopup enabled={isLoggedIn} />
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1200px] flex-col gap-7',
          'px-5 py-7 lg:px-8 lg:py-10'
        )}
      >
        {/* 나와 관련된 블록(배너·현재 스트릭·내 참여 챌린지)을 하나의 그룹으로
            묶어 홈 최상단에 노출한다. sidebar 로딩 판정은 스트릭·챌린지 블록이
            공유(isStreakLoading)해 인증 확정 전에도 동일 높이를 예약,
            레이아웃 시프트를 막는다. */}
        <HomeMineSection
          isLoggedIn={isLoggedIn}
          streakDays={streakDays}
          isStreakLoading={isStreakLoading}
          challenges={sidebar?.challengeList ?? []}
          storiesFetchEnabled={isStoriesEnabled}
          onRequireLogin={handleRequireLogin}
        />

        {/* 모바일 인사 hero — 데스크탑/태블릿은 시안에 따라 생략 */}
        <div className="lg:hidden">
          <HomeWarmGreeting />
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
          isLoggedIn={isLoggedIn}
          onMoreClick={handleMoreChallenges}
          onRequireLogin={handleRequireLogin}
        />

        <HomeRandomDiariesSection
          diaries={randomDiaries}
          isLoading={isDiariesLoading}
          isError={isDiariesError}
          errorMessage={diariesErrorMessage}
          isLoggedIn={isLoggedIn}
          onMoreClick={handleMoreDiaries}
          onRequireLogin={handleRequireLogin}
          onLikeToggle={onLikeToggle}
        />

        <div className="flex w-full justify-center pt-4">
          <PageWatermark />
        </div>
      </div>
    </>
  );
}
