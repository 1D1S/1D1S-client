'use client';

import { Text } from '@1d1s/design-system';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import HomeNoticeStrip from '@feature/home/components/HomeNoticeStrip';
import HomeQuickActions from '@feature/home/components/HomeQuickActions';
import HomeRandomChallengesSection from '@feature/home/components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '@feature/home/components/HomeRandomDiariesSection';
import HomeWarmBanner from '@feature/home/components/HomeWarmBanner';
import { useHomeRandomData } from '@feature/home/hooks/useHomeRandomData';
import { useHomeRandomDiaryLike } from '@feature/home/hooks/useHomeRandomDiaryLike';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

import { useExploreOfficialChallenges } from '../hooks/useExploreOfficialChallenges';

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

  const {
    officialChallenges,
    isLoading: isOfficialLoading,
    isError: isOfficialError,
    errorMessage: officialErrorMessage,
  } = useExploreOfficialChallenges();

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
          // 모바일 sticky 헤더 — 탐색. 탐색은 네비 탭이 있는 최상위 화면이므로
          // 홈/챌린지/일지처럼 뒤로가기 없이 타이틀만 노출한다. 네이티브 쉘은
          // AppTopNav 가 같은 영역을 차지하므로 글로벌 sticky 차단 룰로 가린다.
          <div
            className={cn(
              'sticky top-0 z-20 flex items-center justify-between',
              'gap-3 border-b border-gray-100',
              'bg-white/95 px-5 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3',
              'backdrop-blur lg:hidden'
            )}
          >
            <Text
              as="h1"
              size="heading1"
              weight="extrabold"
              className="tracking-[-0.5px] text-gray-900"
            >
              탐색
            </Text>
          </div>
        }
      >
        <div className="flex flex-col gap-7 pt-2 lg:pt-6">
          {/* 프로모션 배너 — 탐색 페이지 맨 위에 노출 */}
          <HomeWarmBanner />

          {/* 공지·문의 */}
          <div className="grid gap-3 lg:grid-cols-2">
            <HomeNoticeStrip />
            <HomeQuickActions />
          </div>

          <HomeRandomChallengesSection
            challenges={officialChallenges}
            isLoading={isOfficialLoading}
            isError={isOfficialError}
            errorMessage={officialErrorMessage}
            isLoggedIn={isLoggedIn}
            onMoreClick={handleMoreChallenges}
            onRequireLogin={handleRequireLogin}
            title="공식 챌린지"
            subtitle="1D1S가 엄선한 챌린지에 참여해보세요"
            emptyTitle="아직 공식 챌린지가 없어요!"
            official
          />

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
