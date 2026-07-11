'use client';

import { SectionHeader } from '@1d1s/design-system';
import type { SidebarChallenge } from '@feature/member/type/member';
import React from 'react';

import HomeMyChallengesSection from './HomeMyChallengesSection';
import HomeStreakSlot from './HomeStreakSlot';
import HomeWarmBanner from './HomeWarmBanner';

interface HomeMineSectionProps {
  isLoggedIn: boolean;
  streakDays: number;
  isStreakLoading: boolean;
  challenges: SidebarChallenge[];
}

// 배너·현재 스트릭·내 참여 챌린지를 "나와 관련된" 하나의 그룹으로 묶는다.
// 각 하위 블록이 로그인/로딩별로 동일 높이를 유지하므로 그룹 전체도 인증
// 상태 전환 시 레이아웃 시프트가 없다. 비로그인 시엔 스트릭·챌린지 블록이
// 각자 로그인 CTA 로 자연스럽게 전환된다.
export default function HomeMineSection({
  isLoggedIn,
  streakDays,
  isStreakLoading,
  challenges,
}: HomeMineSectionProps): React.ReactElement {
  return (
    // 가로 스크롤(내 챌린지)이 화면 끝까지 흐르며 홈 콘텐츠 라인에 맞도록,
    // 그룹 컨테이너에는 좌우 패딩을 주지 않는다. 그룹감은 공통 헤더 + 하위
    // 블록보다 좁은 내부 간격(gap-4 < 페이지 gap-7)으로 표현한다.
    <section className="w-full">
      <SectionHeader
        title="나의 활동"
        subtitle="스트릭과 참여 중인 챌린지를 한눈에"
        className="[&_h2]:!text-2xl [&_h2]:!tracking-tight"
      />

      <div className="mt-4 flex flex-col gap-4">
        {/* 모바일/태블릿: 스트릭 슬롯을 배너 위로 올림 */}
        <div className="lg:hidden">
          <HomeStreakSlot
            isLoggedIn={isLoggedIn}
            streakDays={streakDays}
            isStreakLoading={isStreakLoading}
          />
        </div>

        {/* 배너 + 스트릭 (lg부터 1:1 좌우, 그 이하에선 위쪽 슬롯 사용) */}
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
          <HomeWarmBanner />
          <div className="hidden lg:block">
            <HomeStreakSlot
              isLoggedIn={isLoggedIn}
              streakDays={streakDays}
              isStreakLoading={isStreakLoading}
            />
          </div>
        </div>

        <HomeMyChallengesSection
          challenges={challenges}
          isLoggedIn={isLoggedIn}
          isLoading={isStreakLoading}
        />
      </div>
    </section>
  );
}
