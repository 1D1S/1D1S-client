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
            'relative aspect-[3/2] overflow-hidden rounded-2xl bg-gray-100'
          )}
        >
          <Skeleton shape="rect" className="absolute inset-0 rounded-none" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Skeleton shape="text" className="h-4 w-[80%]" />
        <Skeleton shape="text" className="h-4 w-[55%]" />
        <ul className="mt-2 flex flex-col gap-1.5">
          <li className="flex items-center gap-1.5">
            <Skeleton shape="rounded" className="h-3 w-3" />
            <Skeleton shape="text" className="h-2.5 w-[70%]" />
          </li>
          <li className="flex items-center gap-1.5">
            <Skeleton shape="rounded" className="h-3 w-3" />
            <Skeleton shape="text" className="h-2.5 w-[45%]" />
          </li>
        </ul>
        <div
          className={cn(
            'mt-2 flex items-center justify-between border-t',
            'border-gray-100 pt-2'
          )}
        >
          <div className="flex -space-x-2">
            <Skeleton shape="circle" className="h-5 w-5" />
            <Skeleton shape="circle" className="h-5 w-5" />
            <Skeleton shape="circle" className="h-5 w-5" />
          </div>
          <Skeleton shape="text" className="h-2.5 w-14" />
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
        'grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3',
        'xl:grid-cols-4',
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
