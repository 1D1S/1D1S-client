'use client';

import type { DiaryItem } from '@feature/diary/board/type/diary';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

import { useHomeRandomData } from '../hooks/useHomeRandomData';
import HomeNoticeStrip from './HomeNoticeStrip';
import HomeQuickActions from './HomeQuickActions';
import HomeRandomChallengesSection from './HomeRandomChallengesSection';
import HomeRandomDiariesSection from './HomeRandomDiariesSection';
import HomeWarmBanner from './HomeWarmBanner';

interface HomeExplorePanelProps {
  isLoggedIn: boolean;
  onRequireLogin(): void;
  onLikeToggle(diary: DiaryItem): void;
}

// "둘러보기" 탭 본문: 배너 → 공지/의견 → 오늘 시작해볼 챌린지 → 오늘의 응원.
// 랜덤 데이터는 이 패널이 마운트(=탭 진입)될 때만 조회한다. 나의 오늘 탭에
// 머무는 사용자는 불필요한 랜덤 조회를 하지 않는다.
export default function HomeExplorePanel({
  isLoggedIn,
  onRequireLogin,
  onLikeToggle,
}: HomeExplorePanelProps): React.ReactElement {
  const router = useRouter();
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

  const handleMoreChallenges = useCallback(
    () => router.push('/challenge'),
    [router]
  );
  const handleMoreDiaries = useCallback(() => router.push('/diary'), [router]);

  return (
    <div className="flex flex-col gap-7">
      <HomeWarmBanner />

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
        onRequireLogin={onRequireLogin}
      />

      <HomeRandomDiariesSection
        diaries={randomDiaries}
        isLoading={isDiariesLoading}
        isError={isDiariesError}
        errorMessage={diariesErrorMessage}
        isLoggedIn={isLoggedIn}
        onMoreClick={handleMoreDiaries}
        onRequireLogin={onRequireLogin}
        onLikeToggle={onLikeToggle}
      />
    </div>
  );
}
