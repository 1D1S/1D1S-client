import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

interface ChallengeCardSkeletonProps {
  className?: string;
}

export function ChallengeCardSkeleton({
  className,
}: ChallengeCardSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white',
        className
      )}
    >
      {/* 썸네일 — 실제 카드와 같은 풀블리드 4:3. 비율이 어긋나면 로딩에서
          실화면으로 넘어갈 때 카드 높이가 튄다. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Skeleton shape="rect" className="absolute inset-0 rounded-none" />
        <Skeleton shape="pill" className="absolute top-2 left-2 h-[22px] w-14" />
        <Skeleton shape="circle" className="absolute top-2 right-2 h-9 w-9" />
      </div>

      <div className="flex flex-col px-[10px] pt-[9px] pb-2">
        <div className="flex items-center gap-1.5">
          <Skeleton shape="pill" className="h-[22px] w-16" />
          <Skeleton shape="pill" className="h-[22px] w-14" />
        </div>

        <div className="mt-1.5 flex min-h-[2.6em] flex-col gap-1">
          <Skeleton shape="text" className="h-4 w-[82%]" />
          <Skeleton shape="text" className="h-4 w-[56%]" />
        </div>

        <div className="mt-1.5 flex flex-col gap-1">
          {['w-[68px]', 'w-[56px]', 'w-[62px]'].map((width) => (
            <div key={width} className="flex items-center gap-1.5">
              <Skeleton shape="rounded" className="h-3.5 w-3.5" />
              <Skeleton shape="text" className={cn('h-[17px]', width)} />
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex min-h-[24px] items-center gap-1.5">
          <Skeleton shape="pill" className="h-[22px] w-20" />
        </div>
      </div>
    </div>
  );
}

interface ChallengeCardSkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function ChallengeCardSkeletonGrid({
  count = 4,
  className,
  itemClassName,
}: ChallengeCardSkeletonGridProps): React.ReactElement {
  return (
    <div
      // 조각별 펄스 대신 그리드 전체가 하나로 깜빡인다(animation.css 참고).
      data-skeleton-group
      className={cn(
        'xs:grid-cols-2 grid grid-cols-1 gap-4 sm:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn('min-w-0', itemClassName)}>
          <ChallengeCardSkeleton />
        </div>
      ))}
    </div>
  );
}
