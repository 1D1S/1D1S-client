'use client';

import { Text } from '@1d1s/design-system';
import { BoardScreenLayout } from '@component/layout/BoardScreenLayout';
import { LoginRequiredDialog } from '@component/LoginRequiredDialog';
import type { ChallengeListResponse } from '@feature/challenge/board/type/challenge';
import HomeNoticeStrip from '@feature/home/components/HomeNoticeStrip';
import HomeRandomChallengesSection from '@feature/home/components/HomeRandomChallengesSection';
import HomeRandomDiariesSection from '@feature/home/components/HomeRandomDiariesSection';
import HomeWarmBanner from '@feature/home/components/HomeWarmBanner';
import { useHomeRandomData } from '@feature/home/hooks/useHomeRandomData';
import { useHomeRandomDiaryLike } from '@feature/home/hooks/useHomeRandomDiaryLike';
import { useIsLoggedIn } from '@feature/member/hooks/useIsLoggedIn';
import { useSignalAppReady } from '@module/hooks/useSignalAppReady';
import { useSignalPageReady } from '@module/hooks/useSignalPageReady';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

import { ExploreGuideStrip } from '../components/ExploreGuideStrip';
import { useExploreOfficialChallenges } from '../hooks/useExploreOfficialChallenges';

// 탐색 상단 배너 높이. 모바일 5:2, md+ 는 고정 높이로 상한(넓은 뷰 과대높이
// 방지). min-h-0 로 flex 부모의 min-content 바닥 제거.
const EXPLORE_BANNER_HEIGHT =
  'aspect-[5/2] min-h-0 md:aspect-auto md:h-[200px] lg:h-[220px]';

// 탐색(/explore): 홈에서 분리한 "둘러보기" 콘텐츠. 배너는 제외하고 오늘 시작해볼
// 챌린지·오늘의 응원(추천 일지)만 노출한다. 비로그인도 열람 가능하며, 카드
// 클릭 시 로그인 유도 다이얼로그를 띄운다.
interface ExploreScreenProps {
  /** 서버가 미리 읽어 둔 공식 챌린지 첫 페이지(초기 HTML 용). */
  initialOfficialPage?: ChallengeListResponse;
}

export default function ExploreScreen({
  initialOfficialPage,
}: ExploreScreenProps = {}): React.ReactElement {
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
  } = useExploreOfficialChallenges(initialOfficialPage);

  // 스플래시 dismiss 신호: 탐색 3개 섹션(공식/추천 챌린지/추천 일지)이 모두
  // 로드(성공 또는 에러 확정)된 뒤 1회 발화.
  useSignalAppReady(
    !isOfficialLoading && !isChallengesLoading && !isDiariesLoading
  );
  useSignalPageReady(
    'explore',
    !isOfficialLoading && !isChallengesLoading && !isDiariesLoading
  );

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
              'bg-white/95 px-5 backdrop-blur',
              'min-h-[60px] pt-[env(safe-area-inset-top)]',
              'lg:hidden'
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
        <div className="flex flex-col gap-10 pt-2 lg:pt-6">
          {/* 프로모션 배너 — 탐색 페이지 맨 위에 노출. 탐색은 flex-col 단독
              배치라 넓은 뷰에서 5:2 가 폭에 비례해 과대해진다. md+ 고정 높이로
              상한을 두고 min-h-0 로 min-content 바닥을 없앤다(홈 grid 배치와
              달라 컨테이너별 높이 클래스를 주입). */}
          <HomeWarmBanner heightClassName={EXPLORE_BANNER_HEIGHT} />

          {/* 공지·가이드 — 데스크톱은 나란히 2열, 모바일은 세로로 쌓인다.
              둘 다 한 줄짜리 진입 스트립이라 같은 줄에 두는 편이 자연스럽고,
              모바일에서도 grid gap(12px)으로 붙어 앞서 잡은 촘촘함이 유지된다
              (예전엔 섹션 간격 40px 때문에 가이드만 혼자 떠 보였다). */}
          <div className="grid gap-3 lg:grid-cols-2">
            <HomeNoticeStrip />
            <ExploreGuideStrip />
          </div>

          <HomeRandomChallengesSection
            challenges={officialChallenges}
            isLoading={isOfficialLoading}
            isError={isOfficialError}
            errorMessage={officialErrorMessage}
            onMoreClick={handleMoreChallenges}
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
            onMoreClick={handleMoreChallenges}
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
