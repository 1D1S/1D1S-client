import { ProgressBar, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface MyPageStreakHeroCardProps {
  currentStreak: number;
  maxStreak: number;
}

/**
 * 디자인 B 의 좌측 그라디언트 hero 카드.
 * 큰 🔥 + 숫자 + 최장 기록 메타 + ProgressBar.
 * DS StreakHero 가 v0.2.x 에 없어 로컬 구현 (1.1.x StreakHero 와 같은 룩).
 */
export function MyPageStreakHeroCard({
  currentStreak,
  maxStreak,
}: MyPageStreakHeroCardProps): React.ReactElement {
  const safeMax = Math.max(maxStreak, 1);
  const remaining = Math.max(0, maxStreak - currentStreak);
  const progress = Math.min(
    100,
    Math.round((currentStreak / safeMax) * 100),
  );
  const meta = remaining > 0
    ? `최장 기록 ${maxStreak}일 · ${remaining}일 남았어요!`
    : `최장 기록 ${maxStreak}일 · 신기록 도전 중!`;

  return (
    <div
      className={cn(
        'rounded-4 border-main-200 border p-6',
        'bg-[linear-gradient(135deg,#fff8f5,#ffe9e0)]',
        'flex flex-col gap-4',
      )}
    >
      <div className="flex items-center justify-between">
        <Text size="caption1" weight="bold" className="text-gray-600">
          현재 연속
        </Text>
        <span aria-hidden className="animate-flame-flicker text-2xl leading-none">
          🔥
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'text-[56px] leading-none font-extrabold',
            'text-main-800 tracking-[-2px] tabular-nums',
          )}
        >
          {currentStreak}
        </span>
        <Text size="heading2" weight="bold" className="text-gray-700">
          일
        </Text>
      </div>
      <Text size="caption1" weight="regular" className="text-gray-700">
        {meta}
      </Text>
      <ProgressBar value={progress} thickness={8} showValueText={false} />
    </div>
  );
}
