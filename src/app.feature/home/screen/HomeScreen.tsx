'use client';

import { BannerCarousel, PageWatermark } from '@1d1s/design-system';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import { HOME_MAIN_BANNERS } from '@constants/consts/homeData';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import HomeQuickActions from '../components/HomeQuickActions';
import HomeRandomChallengesSection from '../components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '../components/HomeRandomDiariesSection';
import { useHomeRandomData } from '../hooks/useHomeRandomData';
import { useHomeRandomDiaryLike } from '../hooks/useHomeRandomDiaryLike';

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

  useEffect(() => {
    if (isLoginRequired && !isLoggedIn) {
      setShowLoginDialog(true);
    }
    // 마운트 시에만 로그인 변경 여부를 확인하기 위해 의존성 배열을 비웠습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDialogOpenChange = (open: boolean): void => {
    setShowLoginDialog(open);
    if (!open && isLoginRequired) {
      // dialog가 닫히는 순간에만 URL 청소
      const params = new URLSearchParams(searchParams.toString());
      params.delete('loginRequired');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  };

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
        onOpenChange={handleDialogOpenChange}
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
