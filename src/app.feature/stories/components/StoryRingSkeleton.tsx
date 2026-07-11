'use client';

import { cn } from '@module/utils/cn';
import React from 'react';

interface StoryRingSkeletonProps {
  /** 표시할 스켈레톤 카드 수 (default 5) */
  count?: number;
}

const SKELETON_SURFACES = [
  'bg-[linear-gradient(180deg,#ffe1d7_0%,#fff7f3_100%)]',
  'bg-[linear-gradient(180deg,#def4ec_0%,#f8fffc_100%)]',
  'bg-[linear-gradient(180deg,#f4e8dc_0%,#fffaf5_100%)]',
];

// 실제 StoryRing 과 동일한 비율을 두고 내용만 pulse 플레이스홀더로 채운다.
export default function StoryRingSkeleton({
  count = 3,
}: StoryRingSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        'gap-3 py-3.5'
      )}
      aria-busy
      aria-label="스토리 불러오는 중"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-[208px] w-[168px] shrink-0 overflow-hidden rounded-[22px]',
            'border border-gray-100',
            SKELETON_SURFACES[index % SKELETON_SURFACES.length]
          )}
        >
          <div className="flex h-full flex-col justify-between px-4 py-6">
            <div className="skeleton-pulse h-6 w-25 rounded-full bg-white/55" />
            <div
              className={cn(
                'skeleton-pulse mx-auto h-12 w-12 rounded-full',
                'bg-white/65'
              )}
            />
            <div className="flex items-center gap-3">
              <span
                className="skeleton-pulse h-10 w-10 rounded-full bg-white/60"
                aria-hidden
              />
              <span className="skeleton-pulse h-4 w-20 rounded bg-white/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
