'use client';

import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

interface HomeStreakSlotProps {
  isLoggedIn: boolean;
  streakDays: number;
  todayGoalCount: number;
  isStreakLoading?: boolean;
}

// 슬롯의 시각적 크기를 양쪽 분기에서 동일하게 유지해 인증 상태 변화 시
// 레이아웃 시프트를 방지한다. (h-full 만으로는 그리드 행 높이가 사이드
// 아이템에 따라 변하므로 min-h 도 함께 지정한다.)
const SLOT_BASE = cn(
  'rounded-3 border-main-200 flex h-full min-h-[140px] w-full',
  'flex-col border p-4 text-left'
);

export default function HomeStreakSlot({
  isLoggedIn,
  streakDays,
  todayGoalCount,
  isStreakLoading = false,
}: HomeStreakSlotProps): React.ReactElement {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <div
        className={cn(
          SLOT_BASE,
          'bg-[linear-gradient(135deg,#fff8f5,#ffe9e0)]'
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-600">
            현재 스트릭
          </span>
          <span aria-hidden className="animate-flame-flicker text-[18px]">
            🔥
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          {isStreakLoading ? (
            <span
              aria-hidden
              className={cn(
                'my-1 inline-block h-6 w-12 animate-pulse rounded',
                'bg-white/70'
              )}
            />
          ) : (
            <>
              <span
                className={cn(
                  'text-main-800 text-[28px] leading-none font-extrabold',
                  'tracking-[-0.6px] tabular-nums'
                )}
              >
                {streakDays}
              </span>
              <span className="text-[13px] font-bold text-gray-700">일째</span>
            </>
          )}
        </div>
        <div className="mt-1.5 text-[10px] text-gray-600">
          {isStreakLoading
            ? ' '
            : todayGoalCount > 0
              ? `오늘의 목표 ${todayGoalCount}개`
              : '오늘도 한 걸음 함께해요'}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push('/login')}
      aria-label="로그인하고 스트릭 시작하기"
      className={cn(
        SLOT_BASE,
        'from-main-100 via-main-200/40 to-main-200 bg-gradient-to-br',
        'group cursor-pointer transition hover:brightness-105'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-600">
          현재 스트릭
        </span>
        <span aria-hidden className="animate-flame-flicker text-[18px]">
          🔥
        </span>
      </div>
      <span
        className={cn(
          'text-[15px] leading-tight font-extrabold tracking-tight',
          'text-gray-900'
        )}
      >
        로그인하고
        <br />
        스트릭 시작하기
      </span>
      <span
        className={cn(
          'mt-auto inline-flex items-center self-start rounded-full',
          'bg-brand px-3 py-1 text-[11px] font-bold text-white'
        )}
      >
        로그인하기 →
      </span>
    </button>
  );
}
