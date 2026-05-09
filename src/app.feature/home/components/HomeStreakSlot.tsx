'use client';

import { StreakHero } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

interface HomeStreakSlotProps {
  isLoggedIn: boolean;
  streakDays: number;
  todayGoalCount: number;
}

export default function HomeStreakSlot({
  isLoggedIn,
  streakDays,
  todayGoalCount,
}: HomeStreakSlotProps): React.ReactElement {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <StreakHero
        days={streakDays}
        meta={`오늘의 목표 ${todayGoalCount}개`}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col justify-between gap-3 p-5',
        'rounded-3 border-main-200 border',
        'from-main-100 via-main-200/40 to-main-200 bg-gradient-to-br'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-600">
          현재 스트릭
        </span>
        <span aria-hidden className="animate-flame-flicker text-[18px]">
          🔥
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            'text-[18px] leading-tight font-extrabold tracking-tight',
            'text-gray-900'
          )}
        >
          로그인하고
          <br />
          스트릭을 시작해보세요
        </span>
        <span className="text-[11px] text-gray-600">
          오늘의 기록이 쌓이면 스트릭이 됩니다.
        </span>
      </div>
      <button
        type="button"
        onClick={() => router.push('/login')}
        className={cn(
          'mt-1 inline-flex items-center justify-center self-start',
          'rounded-2 bg-brand px-4 py-2',
          'text-[12px] font-bold text-white transition',
          'hover:brightness-105'
        )}
      >
        로그인하기 →
      </button>
    </div>
  );
}
