'use client';

import { Text } from '@1d1s/design-system';
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

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Text size="body1" weight="medium" className="text-gray-500">
          불러오는 중...
        </Text>
      </div>
    );
  }

  const { nickname, profileUrl, email, streak, challengeList } = data;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-12">
      {/* Full-bleed gradient banner */}
      <MyPageHeroBanner />

      {/* Centered content container */}
      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 lg:px-8',
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
        />

        {/* Streak hero + Heatmap (1:1 grid on desktop) */}
        <div
          className={cn(
            'mt-6 grid grid-cols-1 gap-4',
            'lg:grid-cols-2 lg:gap-5',
          )}
        >
          <MyPageStreakHeroCard
            currentStreak={streak.currentStreak}
            maxStreak={streak.maxStreak}
          />
          <MyPageActivityHeatmap calendar={streak.calendar} />
        </div>

        <div className="mt-8">
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
            nickname={nickname}
            profileUrl={profileUrl}
          />
        </div>
      </div>
    </div>
  );
}
