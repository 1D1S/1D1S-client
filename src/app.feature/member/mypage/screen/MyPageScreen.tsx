'use client';

import { Button } from '@1d1s/design-system';
import { MyPageSkeleton } from '@component/skeletons/MyPageSkeleton';
import { useMyDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import { MyPageFriendsEntry } from '@feature/friend/components/MyPageFriendsEntry';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import { MyPageStatisticsEntry } from '@feature/member/statistics/components/MyPageStatisticsEntry';
import { useAuthStatus } from '@module/hooks/useAuthStatus';
import { cn } from '@module/utils/cn';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { MyPageActiveChallenges } from '../components/MyPageActiveChallenges';
import { MyPageActivityHeatmap } from '../components/MyPageActivityHeatmap';
import { MyPageBadgesSection } from '../components/MyPageBadgesSection';
import { MyPageDiarySection } from '../components/MyPageDiarySection';
import { MyPageHeroBanner } from '../components/MyPageHeroBanner';
import { MyPagePhoneBanner } from '../components/MyPagePhoneBanner';
import { MyPageProfileCard } from '../components/MyPageProfileCard';
import { MyPageStatSection } from '../components/MyPageStatSection';
import { MyPageStreakHeroCard } from '../components/MyPageStreakHeroCard';

export default function MyPageScreen(): React.ReactElement | null {
  const router = useRouter();
  // 부팅 세션 확인 전(`unknown`)에는 리다이렉트하지 않는다. 확정된 게스트만
  // /login 으로 보낸다 — 예전엔 확인 전 false 구간에 로그인 사용자까지 튕겨
  // Safari PWA 첫 진입에서 로그인 상태인데 /login 으로 밀리는 사고가 있었다.
  const status = useAuthStatus();
  const isGuest = status === 'guest';
  const { data, isLoading } = useMyPage();
  const { data: myDiariesData } = useMyDiaries(5);
  const showSkeleton = useMinimumLoading(isLoading);

  useEffect(() => {
    if (isGuest) {
      router.replace(loginUrlFromCurrentLocation());
    }
  }, [isGuest, router]);

  if (isGuest) {
    return null;
  }

  if (showSkeleton || !data) {
    return <MyPageSkeleton />;
  }

  const { nickname, profileUrl, streak, challengeList } = data;
  // 미입력 회원은 응답에 phoneNumber 키가 없다.
  const phoneMissing = !data.phoneNumber;
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
          'px-5 py-7 lg:px-8 lg:py-10'
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
          showPhoneBadge={phoneMissing}
          diaryHref="/mypage/diary"
          challengeHref="/mypage/challenge"
        />

        {phoneMissing ? <MyPagePhoneBanner className="mt-6" /> : null}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MyPageFriendsEntry />
          <MyPageStatisticsEntry />
        </div>

        {/* Streak hero + Heatmap — 모바일은 활동 캘린더(잔디)만 노출.
            현재 연속 hero 는 프로필 카드가 대체하므로 데스크탑 전용 */}
        <div
          className={cn(
            'mt-6 grid grid-cols-1 gap-4',
            'lg:grid-cols-2 lg:gap-5'
          )}
        >
          <div className="hidden lg:block">
            <MyPageStreakHeroCard
              currentStreak={streak.currentStreak}
              maxStreak={streak.maxStreak}
            />
          </div>
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
            action={
              <Button
                size="sm"
                onClick={() => router.push('/diary/create')}
              >
                새 일지 작성하기
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
