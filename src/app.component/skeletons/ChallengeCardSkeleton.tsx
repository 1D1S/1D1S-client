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
        'overflow-hidden rounded-2xl border border-gray-100 bg-white',
        className
      )}
    >
      <div className="px-3 pt-3">
        <div
          className={cn(
            'relative aspect-[21/9] overflow-hidden rounded-lg bg-gray-100'
          )}
        >
          <Skeleton shape="rect" className="absolute inset-0 rounded-none" />
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            <Skeleton shape="pill" className="h-5 w-14" />
            <Skeleton shape="pill" className="h-5 w-12" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex min-h-[2.6em] flex-col gap-1.5">
          <Skeleton shape="text" className="h-4 w-[82%]" />
          <Skeleton shape="text" className="h-4 w-[56%]" />
        </div>
        <ul
          className={cn(
            'mt-1 flex flex-col gap-1 text-[11px] text-gray-500',
            'sm:text-xs'
          )}
        >
          <li className="flex items-center gap-1.5">
            <Skeleton shape="rounded" className="h-3 w-3" />
            <Skeleton shape="text" className="h-3 w-[72%]" />
          </li>
          <li className="flex items-center gap-1.5">
            <Skeleton shape="rounded" className="h-3 w-3" />
            <Skeleton shape="text" className="h-3 w-[58%]" />
          </li>
        </ul>
        <div
          className={cn(
            'mt-2 flex items-center justify-between border-t',
            'border-gray-100 pt-2'
          )}
        >
          <div className="inline-flex items-center gap-2">
            <div className="flex -space-x-2">
              <Skeleton shape="circle" className="h-5 w-5" />
              <Skeleton shape="circle" className="h-5 w-5" />
              <Skeleton shape="circle" className="h-5 w-5" />
            </div>
            <Skeleton shape="text" className="h-3 w-6" />
          </div>
          <Skeleton shape="text" className="h-3 w-16" />
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
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3',
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
