import { cn } from '@module/utils/cn';
import React from 'react';

// 탭 라벨 옆 카운트 배지 — 원형 배경. 활성 탭은 브랜드 톤.
// ChallengeDetailScreen 에서 분리한 프레젠테이션 컴포넌트(마크업 불변).
export function TabCountBadge({
  value,
  active,
}: {
  value: number;
  active: boolean;
}): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex aspect-square h-[1.125rem] min-w-[1.125rem]',
        'items-center justify-center rounded-full px-1',
        'text-[11px] leading-none font-bold',
        active ? 'bg-main-100 text-main-800' : 'bg-gray-100 text-gray-500'
      )}
    >
      {value}
    </span>
  );
}
