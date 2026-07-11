'use client';

import { MobileHeader } from '@1d1s/design-system';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import HomeRandomChallengesSection from '@feature/home/components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '@feature/home/components/HomeRandomDiariesSection';
import { useHomeRandomData } from '@feature/home/hooks/useHomeRandomData';
import { useHomeRandomDiaryLike } from '@feature/home/hooks/useHomeRandomDiaryLike';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

// 탐색(/explore): 홈에서 분리한 "둘러보기" 콘텐츠. 배너는 제외하고 오늘 시작해볼
// 챌린지·오늘의 응원(추천 일지)만 노출한다. 비로그인도 열람 가능하며, 카드
// 클릭 시 로그인 유도 다이얼로그를 띄운다.
export default function ExploreScreen(): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const { showLoginDialog, setShowLoginDialog, onLikeToggle } =
    useHomeRandomDiaryLike();

  const handleRequireLogin = useCallback(
    () => setShowLoginDialog(true),
    [setShowLoginDialog]
  );
  const handleMoreChallenges = useCallback(
    () => router.push('/challenge'),
    [router]
  );
  const handleMoreDiaries = useCallback(() => router.push('/diary'), [router]);

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

  return (
    <>
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      <BoardScreenLayout
        title="탐색"
        description="오늘 시작해볼 챌린지와 다른 사람들의 기록을 만나보세요."
        mobileHeader={
          <MobileHeader title="탐색" onBack={() => router.push('/')} />
        }
      >
        <div className="flex flex-col gap-7 pt-2 lg:pt-6">
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
        </div>
      </BoardScreenLayout>
    </>
  );
}
