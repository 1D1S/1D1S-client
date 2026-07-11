'use client';

import { CountUp } from '@component/CountUp';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React from 'react';

interface HomeStreakSlotProps {
  streakDays: number;
  isStreakLoading?: boolean;
}

// 다음 스트릭 목표(일 수)를 계산한다.
// - 30일 미만: 30, 30~50: 50, 50~100: 100, 100~200: 200
// - 그 이후로는 100일 단위 마일스톤을 쓰되, 다음 100일 마일스톤이
//   "직후의 연 단위(365n)"와 100일 이내라면 100일 마일스톤을
//   생략하고 연 단위 마일스톤을 다음 목표로 사용한다.
//   예: 600 -> 730(2년), 900 -> 1095(3년), 1400 -> 1460(4년)
export function getStreakGoal(days: number): number {
  if (days < 30) {
    return 30;
  }
  if (days < 50) {
    return 50;
  }
  if (days < 100) {
    return 100;
  }
  if (days < 200) {
    return 200;
  }
  const candidate = Math.floor(days / 100) * 100 + 100;
  const nextYear = (Math.floor(days / 365) + 1) * 365;
  if (nextYear > days && nextYear <= candidate + 100) {
    return nextYear;
  }
  return candidate;
}

function getGoalLabel(goal: number): string {
  if (goal === 30) {
    return '한 달';
  }
  if (goal % 365 === 0) {
    return `${goal / 365}년`;
  }
  return `${goal}일`;
}

// 슬롯의 시각적 크기를 양쪽 분기에서 동일하게 유지해 인증 상태 변화 시
// 레이아웃 시프트를 방지한다.
const SLOT_BASE = cn(
  'rounded-3 border-main-200 flex h-full min-h-[140px] w-full border p-4'
);

const RING_SIZE = 76;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function HomeStreakSlot({
  streakDays,
  isStreakLoading = false,
}: HomeStreakSlotProps): React.ReactElement {
  const router = useRouter();

  const goal = getStreakGoal(streakDays);
  const goalLabel = getGoalLabel(goal);
  const remaining = Math.max(0, goal - streakDays);
  const progress = goal > 0 ? Math.min(1, streakDays / goal) : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div
      className={cn(
        SLOT_BASE,
        'bg-[linear-gradient(135deg,#fff8f5,#ffe9e0)]',
        'flex-row items-center gap-3 sm:gap-4'
      )}
    >
      <div
        className="relative shrink-0"
        style={{ width: RING_SIZE, height: RING_SIZE }}
        aria-hidden
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90"
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="#ffd9c8"
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="var(--main-800)"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={isStreakLoading ? RING_CIRCUMFERENCE : dashOffset}
            style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
          />
        </svg>
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'animate-flame-flicker text-[28px] leading-none'
          )}
        >
          🔥
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[12px] font-bold text-gray-600">현재 스트릭</span>
        {isStreakLoading ? (
          <span
            aria-hidden
            className={cn(
              // 실제 숫자 줄(mt-0.5 + text-[26px] leading-none)과 높이를
              // 맞춰 로드 시 아래 문구가 위로 당겨지지 않게 한다.
              'skeleton-pulse mt-0.5 inline-block h-[26px] w-32 rounded',
              'bg-white/70'
            )}
          />
        ) : (
          <div className="data-fade-in mt-0.5 flex items-baseline gap-1">
            <span
              className={cn(
                'text-main-800 text-[26px] leading-none font-extrabold',
                'tracking-[-0.6px] tabular-nums'
              )}
            >
              <CountUp value={streakDays} />
            </span>
            <span className="text-[14px] font-bold text-gray-800">
              일째 도전 중
            </span>
          </div>
        )}
        <span
          className={cn(
            'mt-1.5 text-[11px] text-gray-500',
            !isStreakLoading && 'data-fade-in'
          )}
        >
          {isStreakLoading
            ? ' '
            : remaining === 0
              ? `${goalLabel} 달성! 🎉`
              : `${remaining}일 후 ${goalLabel} 달성! 🎉`}
        </span>
      </div>
      <button
        type="button"
        onClick={() => router.push('/diary/create')}
        aria-label="오늘 일지 기록하기"
        className={cn(
          'bg-main-700 hover:bg-main-800 shrink-0 cursor-pointer',
          'rounded-full px-4 py-2.5 text-[13px] font-bold text-white',
          'animate-cta-pulse transition'
        )}
      >
        오늘 기록 +
      </button>
    </div>
  );
}
