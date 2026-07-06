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
        'rounded-2xl border border-gray-300 bg-white p-4',
        className
      )}
    >
      {/* 헤더: 챌린지 칩 | 감정 배지 */}
      <div className="flex items-center justify-between gap-2">
        <Skeleton shape="pill" className="h-5 w-20" />
        <Skeleton shape="circle" className="h-6 w-6" />
      </div>
      {/* 제목 2줄 */}
      <Skeleton shape="text" className="mt-3 h-3.5 w-[90%]" />
      <Skeleton shape="text" className="mt-1.5 h-3.5 w-[60%]" />
      {/* 목표 체크 + 달성률 */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Skeleton shape="circle" className="h-4 w-4" />
            <Skeleton shape="text" className="h-2.5 w-24" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton shape="circle" className="h-4 w-4" />
            <Skeleton shape="text" className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton shape="text" className="h-3 w-12" />
      </div>
      {/* 푸터: 작성자 | 좋아요·댓글 */}
      <div
        className={cn(
          'mt-3 flex items-center justify-between gap-2',
          'border-t border-gray-100 pt-2.5'
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <Skeleton shape="circle" className="h-5 w-5" />
          <Skeleton shape="text" className="h-2.5 w-12" />
        </div>
        <Skeleton shape="pill" className="h-6 w-16" />
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
        'grid grid-cols-2 items-start gap-2.5',
        'sm:grid-cols-3 sm:gap-4',
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
