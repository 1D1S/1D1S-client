'use client';

import { MyPageSkeleton } from '@component/skeletons/MyPageSkeleton';
import { useMyDiaries } from '@feature/diary/board/hooks/useDiaryQueries';
import { MyPageFriendsEntry } from '@feature/friend/components/MyPageFriendsEntry';
import { useMyPage } from '@feature/member/hooks/useMemberQueries';
import { cn } from '@module/utils/cn';
import React from 'react';

import { MyPageActiveChallenges } from '../components/MyPageActiveChallenges';
import { MyPageActivityHeatmap } from '../components/MyPageActivityHeatmap';
import { MyPageBadgesSection } from '../components/MyPageBadgesSection';
import { MyPageDiarySection } from '../components/MyPageDiarySection';
import { MyPageHeroBanner } from '../components/MyPageHeroBanner';
import { MyPageProfileCard } from '../components/MyPageProfileCard';
import { MyPageStatSection } from '../components/MyPageStatSection';
import { MyPageStreakHeroCard } from '../components/MyPageStreakHeroCard';

export default function MyPageScreen(): React.ReactElement {
  const { data, isLoading } = useMyPage();
  const { data: myDiariesData } = useMyDiaries(5);

  if (isLoading || !data) {
    return <MyPageSkeleton />;
  }

  const { nickname, profileUrl, email, streak, challengeList } = data;
  const myDiaries = myDiariesData?.items ?? [];
  const hasMoreDiaries = myDiariesData?.pageInfo.hasNextPage ?? false;

  return (
    <div
      className={cn(
        'min-h-screen w-full bg-white lg:bg-gray-50',
        'data-fade-in'
      )}
    >
      {/* Full-bleed gradient banner — 모바일에서는 프로필 카드가 페이지 헤더 역할 */}
      <div className="hidden lg:block">
        <MyPageHeroBanner />
      </div>

      {/* Centered content container — 표준 반응형 패딩 */}
      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10',
        )}
      >
        <MyPageProfileCard
          nickname={nickname}
          profileUrl={profileUrl}
          email={email}
          totalDiaryCount={streak.totalDiaryCount}
          totalChallengeCount={streak.totalChallengeCount ?? 0}
          completedFiniteChallengeCount={
            streak.completedFiniteChallengeCount ?? 0
          }
          currentStreak={streak.currentStreak}
        />

        {/* Streak hero + Heatmap — 모바일에서는 숨김 */}
        <div
          className={cn(
            'mt-6 hidden grid-cols-1 gap-4',
            'lg:grid lg:grid-cols-2 lg:gap-5',
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

        <div className="mt-6">
          <MyPageFriendsEntry />
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
