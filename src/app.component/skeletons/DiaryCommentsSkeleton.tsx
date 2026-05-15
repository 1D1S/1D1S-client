import { Skeleton } from '@component/Skeleton';
import React from 'react';

interface DiaryCommentsSkeletonProps {
  count?: number;
}

export function DiaryCommentsSkeleton({
  count = 3,
}: DiaryCommentsSkeletonProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-2.5">
          <Skeleton shape="circle" className="h-8 w-8 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton shape="text" className="h-3 w-20" />
            <Skeleton shape="text" className="h-3.5 w-[85%]" />
            <Skeleton shape="text" className="h-3.5 w-[55%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
