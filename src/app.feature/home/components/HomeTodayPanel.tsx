'use client';

import type { SidebarChallenge } from '@feature/member/type/member';
import Stories from '@feature/stories/components/Stories';
import { cn } from '@module/utils/cn';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';
import { useRouter } from 'next/navigation';
import React from 'react';

import { isChallengeEndedOrArchived } from '../utils/homeFormatters';
import HomeMyChallengesSection from './HomeMyChallengesSection';
import HomeStreakSlot from './HomeStreakSlot';
import HomeTodayWriteSection from './HomeTodayWriteSection';

interface HomeTodayPanelProps {
  isLoggedIn: boolean;
  streakDays: number;
  isStreakLoading: boolean;
  challenges: SidebarChallenge[];
  storiesFetchEnabled: boolean;
  onRequireLogin(): void;
}

// "나의 오늘" 탭 본문: 스트릭 → 오늘의 기록(미작성 바로 쓰기) → 참여 중인
// 챌린지 → 스토리. 탭 자체가 그룹핑이므로 별도 패널 박스로 감싸지 않고,
// 카드는 좌측 정렬(breakout 없음)로 흐른다. 비로그인 시엔 단일 로그인 CTA만
// 노출하되, 최소 높이를 예약해 탭 전환/인증 확정 시 시프트를 줄인다.
export default function HomeTodayPanel({
  isLoggedIn,
  streakDays,
  isStreakLoading,
  challenges,
  storiesFetchEnabled,
  onRequireLogin,
}: HomeTodayPanelProps): React.ReactElement {
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <section className="w-full">
        <button
          type="button"
          onClick={() => router.push(loginUrlFromCurrentLocation())}
          aria-label="로그인하고 나의 오늘 시작하기"
          className={cn(
            'flex min-h-[320px] w-full flex-col items-center justify-center',
            'rounded-4 border-main-200 gap-3 border p-8 text-center',
            'from-main-100 via-main-200/40 to-main-200 bg-gradient-to-br',
            'cursor-pointer transition hover:brightness-105'
          )}
        >
          <span aria-hidden className="animate-flame-flicker text-[40px]">
            🔥
          </span>
          <span className="text-[18px] font-extrabold tracking-tight text-gray-900">
            로그인하고 나의 오늘을 시작하세요
          </span>
          <span className="text-[13px] text-gray-600">
            스트릭·오늘의 기록·참여 중인 챌린지를 한곳에서 이어가요.
          </span>
          <span
            className={cn(
              'mt-1 inline-flex items-center rounded-full',
              'bg-brand px-4 py-2 text-[13px] font-bold text-white'
            )}
          >
            로그인하기 →
          </span>
        </button>
      </section>
    );
  }

  const ongoing = challenges.filter(
    (challenge) =>
      !isChallengeEndedOrArchived(challenge.endDate, challenge.participantCnt)
  );

  return (
    <div className="flex flex-col gap-6">
      <HomeStreakSlot
        streakDays={streakDays}
        isStreakLoading={isStreakLoading}
      />

      <HomeTodayWriteSection
        challenges={ongoing}
        isAuthLoading={isStreakLoading}
      />

      <HomeMyChallengesSection
        challenges={challenges}
        isLoading={isStreakLoading}
      />

      <Stories
        isLoggedIn={isLoggedIn}
        fetchEnabled={storiesFetchEnabled}
        onRequireLogin={onRequireLogin}
      />
    </div>
  );
}
