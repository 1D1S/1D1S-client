'use client';

import { BannerCarousel, PageWatermark } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { HOME_MAIN_BANNERS } from '@constants/consts/home-data';
import { authStorage } from '@module/utils/auth';
import { useRouter } from 'next/navigation';
import React from 'react';

import HomeQuickActions from '../components/home-quick-actions';
import HomeRandomChallengesSection from '../components/home-random-challenges-section';
import HomeRandomDiariesSection from '../components/home-random-diaries-section';
import { useHomeRandomData } from '../hooks/use-home-random-data';
import { useHomeRandomDiaryLike } from '../hooks/use-home-random-diary-like';

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const { isLikePending, showLoginDialog, setShowLoginDialog, onLikeToggle } =
    useHomeRandomDiaryLike();
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
    <div className="flex min-h-screen w-full flex-col bg-white">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      {/* 메인 콘텐츠 */}
      <div className="flex w-full flex-col pt-6">
        <div className="h-6" />

        {/* 메인 배너 영역 */}
        <div className="w-full px-4">
          <BannerCarousel
            items={HOME_MAIN_BANNERS}
            autoSlideIntervalMs={5000}
            enableLoop
            showIndicators
            aspectRatioClassName="aspect-[5/1]"
            minHeightPx={140}
            onItemClick={(_, index) => {
              const route = HOME_MAIN_BANNERS[index]?.href;

              if (route) {
                router.push(route);
              }
            }}
          />
        </div>

        <div className="h-3" />

        {/* 버튼 영역 */}
        <HomeQuickActions onNavigate={(path) => router.push(path)} />

        <div className="h-10" />

        {/* 랜덤 챌린지 */}
        <HomeRandomChallengesSection
          challenges={randomChallenges}
          isLoading={isChallengesLoading}
          isError={isChallengesError}
          errorMessage={challengesErrorMessage}
          onMoreClick={() => router.push('/challenge')}
          onChallengeClick={(challengeId) => {
            if (!authStorage.hasTokens()) {
              setShowLoginDialog(true);
              return;
            }
            router.push(`/challenge/${challengeId}`);
          }}
        />

        <div className="h-12" />

        {/* 랜덤 일지 */}
        <HomeRandomDiariesSection
          diaries={randomDiaries}
          isLoading={isDiariesLoading}
          isError={isDiariesError}
          errorMessage={diariesErrorMessage}
          isLikePending={isLikePending}
          onMoreClick={() => router.push('/diary')}
          onDiaryClick={(diaryId) => {
            if (!authStorage.hasTokens()) {
              setShowLoginDialog(true);
              return;
            }
            router.push(`/diary/${diaryId}`);
          }}
          onLikeToggle={onLikeToggle}
          onChallengeClick={(challengeId) =>
            router.push(
              challengeId ? `/challenge/${challengeId}` : '/challenge'
            )
          }
        />

        <div className="h-12" />
        <div className="flex w-full justify-center">
          <PageWatermark />
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
}
