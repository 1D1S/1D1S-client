import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

interface DiaryCardSkeletonProps {
  className?: string;
}

export function DiaryCardSkeleton({
  className,
}: DiaryCardSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-100 bg-white',
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full bg-gray-100">
        <Skeleton shape="rect" className="absolute inset-0 rounded-none" />
        <div className="absolute top-2 left-2 z-10">
          <Skeleton shape="pill" className="h-5 w-12" />
        </div>
        <div className="absolute top-2 right-2 z-10">
          <Skeleton shape="circle" className="h-8 w-8" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <Skeleton shape="text" className="h-3.5 w-[80%]" />
        <Skeleton shape="pill" className="h-4 w-14" />
        <div
          className={cn(
            'mt-1 flex items-center justify-between gap-2 pt-1.5'
          )}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <Skeleton shape="circle" className="h-5 w-5" />
            <Skeleton shape="text" className="h-2.5 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton shape="circle" className="h-3 w-3" />
            <Skeleton shape="text" className="h-2.5 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiaryCardSkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function DiaryCardSkeletonGrid({
  count = 8,
  className,
  itemClassName,
}: DiaryCardSkeletonGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn('min-w-0', itemClassName)}>
          <DiaryCardSkeleton />
        </div>
      ))}
    </div>
  );
}
