'use client';

import { MyPageSkeleton } from '@component/skeletons/MyPageSkeleton';
import { useMyDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import { MyPageFriendsEntry } from '@feature/friend/components/MyPageFriendsEntry';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useEffect, useSyncExternalStore } from 'react';

import { MyPageActiveChallenges } from '../components/MyPageActiveChallenges';
import { MyPageActivityHeatmap } from '../components/MyPageActivityHeatmap';
import { MyPageBadgesSection } from '../components/MyPageBadgesSection';
import { MyPageDiarySection } from '../components/MyPageDiarySection';
import { MyPageHeroBanner } from '../components/MyPageHeroBanner';
import { MyPageProfileCard } from '../components/MyPageProfileCard';
import { MyPageStatSection } from '../components/MyPageStatSection';
import { MyPageStreakHeroCard } from '../components/MyPageStreakHeroCard';

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

export default function MyPageScreen(): React.ReactElement | null {
  const router = useRouter();
  // 하이드레이션 직후 useIsLoggedIn 이 false 인 구간에 /login 로 라우팅되는 것을 막기 위한 가드.
  const hasMounted = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false
  );
  const isLoggedIn = useIsLoggedIn();
  const { data, isLoading } = useMyPage();
  const { data: myDiariesData } = useMyDiaries(5);
  const showSkeleton = useMinimumLoading(isLoading);

  // 미들웨어가 잔존 쿠키 등으로 통과시킨 비로그인 사용자를 /login 으로 보낸다.
  useEffect(() => {
    if (hasMounted && !isLoggedIn) {
      router.replace('/login');
    }
  }, [hasMounted, isLoggedIn, router]);

  if (hasMounted && !isLoggedIn) {
    return null;
  }

  if (showSkeleton || !data) {
    return <MyPageSkeleton />;
  }

  const { nickname, profileUrl, streak, challengeList } = data;
  const myDiaries = myDiariesData?.items ?? [];
  const hasMoreDiaries = myDiariesData?.pageInfo.hasNextPage ?? false;

  return (
    <div className="data-fade-in min-h-screen w-full bg-white">
      {/* Full-bleed gradient banner — 모바일에서는 프로필 카드가 페이지 헤더 역할 */}
      <div className="hidden lg:block">
        <MyPageHeroBanner />
      </div>

      {/* Centered content container — 표준 반응형 패딩 */}
      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <MyPageProfileCard
          nickname={nickname}
          profileUrl={profileUrl}
          totalDiaryCount={streak.totalDiaryCount}
          totalChallengeCount={streak.totalChallengeCount ?? 0}
          completedFiniteChallengeCount={
            streak.completedFiniteChallengeCount ?? 0
          }
          currentStreak={streak.currentStreak}
        />

        <div className="mt-6">
          <MyPageFriendsEntry />
        </div>

        {/* Streak hero + Heatmap — 모바일에서는 숨김 */}
        <div
          className={cn(
            'mt-6 hidden grid-cols-1 gap-4',
            'lg:grid lg:grid-cols-2 lg:gap-5'
          )}
        >
          <MyPageStreakHeroCard
            currentStreak={streak.currentStreak}
            maxStreak={streak.maxStreak}
          />
          <MyPageActivityHeatmap calendar={streak.calendar} />
        </div>

        {/* 통계 섹션 — 모바일에서는 프로필 카드 내부 grid로 대체 */}
        <div className="mt-8 hidden lg:block">
          <MyPageStatSection streak={streak} />
        </div>

        <div className="mt-8">
          <MyPageBadgesSection streak={streak} />
        </div>

        <div className="mt-8">
          <MyPageActiveChallenges challengeList={challengeList} />
        </div>

        <div className="mt-8">
          <MyPageDiarySection
            title="내 일지"
            diaries={myDiaries}
            nickname={nickname}
            hasMore={hasMoreDiaries}
            viewAllHref="/mypage/diary"
          />
        </div>
      </div>
    </div>
  );
}
