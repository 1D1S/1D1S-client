'use client';

import { BannerCarousel, PageWatermark } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/login-required-dialog';
import { HOME_MAIN_BANNERS } from '@constants/consts/home-data';
import { useIsLoggedIn } from '@feature/member/hooks/use-is-logged-in';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import HomeQuickActions from '../components/home-quick-actions';
import HomeRandomChallengesSection from '../components/home-random-challenges-section';
import HomeRandomDiariesSection from '../components/home-random-diaries-section';
import { useHomeRandomData } from '../hooks/use-home-random-data';
import { useHomeRandomDiaryLike } from '../hooks/use-home-random-diary-like';

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginRequired = searchParams.get('loginRequired') === 'true';
  const isLoggedIn = useIsLoggedIn();
  const { isLikePending, showLoginDialog, setShowLoginDialog, onLikeToggle } =
    useHomeRandomDiaryLike();
  const loginDialogDescription = isLoginRequired
    ? '로그인 후 이용할 수 있습니다.'
    : undefined;

  const [prevIsLoginRequired, setPrevIsLoginRequired] = useState(false);
  if (isLoginRequired !== prevIsLoginRequired) {
    setPrevIsLoginRequired(isLoginRequired);
    if (isLoginRequired) {
      setShowLoginDialog(true);
    }
  }

  useEffect(() => {
    if (!isLoginRequired) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete('loginRequired');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [isLoginRequired, pathname, router, searchParams]);

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
        description={loginDialogDescription}
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

        <div className="h-4" />

        {/* 문의 버튼 */}
        <HomeQuickActions />

        <div className="h-10" />

        {/* 랜덤 챌린지 */}
        <HomeRandomChallengesSection
          challenges={randomChallenges}
          isLoading={isChallengesLoading}
          isError={isChallengesError}
          errorMessage={challengesErrorMessage}
          onMoreClick={() => router.push('/challenge')}
          onChallengeClick={(challengeId) => {
            if (!isLoggedIn) {
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
            if (!isLoggedIn) {
              setShowLoginDialog(true);
              return;
            }
            router.push(`/diary/${diaryId}`);
          }}
          onLikeToggle={onLikeToggle}
          onUserClick={(memberId) => router.push(`/member/${memberId}`)}
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
