import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import type { AchievementBadgeTone } from '../utils/mypageUtils';

interface MyPageBadgeTileProps {
  emoji: string;
  label: string;
  tone: AchievementBadgeTone;
  achieved: boolean;
}

const toneClass: Record<AchievementBadgeTone, string> = {
  main: 'bg-main-300',
  peach: 'bg-main-200',
  mint: 'bg-mint-200',
  blue: 'bg-blue-200',
  green: 'bg-mint-300',
  gray: 'bg-gray-100',
};

/**
 * 획득한 배지 타일 — vertical 레이아웃.
 * DS AchievementBadge 가 v0.2.x 에 없어 로컬 구현
 * (1.1.x AchievementBadge 와 동일한 룩, vertical/lg 사이즈).
 */
export function MyPageBadgeTile({
  emoji,
  label,
  tone,
  achieved,
}: MyPageBadgeTileProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-[14px] px-4 py-5',
        'text-center',
        toneClass[tone],
        !achieved && 'opacity-60',
      )}
    >
      <span aria-hidden className="text-[34px] leading-none">
        {emoji}
      </span>
      <Text size="caption2" weight="bold" className="text-gray-900">
        {label}
      </Text>
    </div>
  );
}
