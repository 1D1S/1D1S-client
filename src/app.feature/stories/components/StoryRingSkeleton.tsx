'use client';

import { Card } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface StoryRingSkeletonProps {
  /** 표시할 스켈레톤 카드 수 (default 5) */
  count?: number;
}

// 실제 StoryRing 과 동일한 Card 테두리 래퍼 + 썸네일/제목/프로필+이름/시간
// 레이아웃을 그대로 두고, 내용만 회색 pulse 플레이스홀더로 채운다.
export default function StoryRingSkeleton({
  count = 5,
}: StoryRingSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide flex w-full overflow-x-auto',
        'gap-3 px-5 py-3.5 lg:px-8'
      )}
      aria-busy
      aria-label="스토리 불러오는 중"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} radius="md" className="w-[140px] flex-shrink-0">
          <Card.Thumb className="aspect-[4/5] bg-gray-100">
            <div className="skeleton-pulse h-full w-full bg-gray-100" />
          </Card.Thumb>
          <Card.Body className="gap-1.5 p-3">
            <div className="skeleton-pulse h-3 w-3/4 rounded bg-gray-100" />
            <Card.Meta>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span
                  className={cn(
                    'skeleton-pulse h-5 w-5 shrink-0 rounded-full bg-gray-100'
                  )}
                  aria-hidden
                />
                <span className="skeleton-pulse h-2.5 w-12 rounded bg-gray-100" />
              </span>
              <span
                className={cn(
                  'skeleton-pulse h-2.5 w-8 shrink-0 rounded bg-gray-100'
                )}
              />
            </Card.Meta>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
