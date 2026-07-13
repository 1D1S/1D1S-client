'use client';

import { cn } from '@module/utils/cn';
import React from 'react';

interface StoryRingSkeletonProps {
  /** 표시할 스켈레톤 원 수 (default 6) */
  count?: number;
}

// 실제 StoryRing 과 동일한 사각 카드 크기/간격을 두고 내용만 pulse 로
// 채운다. (h-[180px] w-[144px] + gap-3 + py-3.5 → 레이아웃 시프트 없이
// 데이터로 전환)
export default function StoryRingSkeleton({
  count = 6,
}: StoryRingSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full items-start gap-3',
        'overflow-x-auto py-3.5'
      )}
      aria-busy
      aria-label="스토리 불러오는 중"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'skeleton-pulse h-[180px] w-[144px] shrink-0 rounded-[20px]',
            'bg-gray-100'
          )}
        />
      ))}
    </div>
  );
}
