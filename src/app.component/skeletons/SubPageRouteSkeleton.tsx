import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

export function SubPageRouteSkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen w-full bg-white">
      <div
        data-native-subpage-content
        className="mx-auto w-full max-w-[980px] p-4 lg:p-6"
      >
        <div className="hidden border-b border-gray-200 pb-5 lg:block">
          <Skeleton shape="text" className="h-8 w-36" />
          <Skeleton shape="text" className="mt-2 h-4 w-60" />
        </div>
        <div
          data-native-subpage-body
          className={cn('mt-6 flex flex-col gap-3')}
        >
          <Skeleton shape="rounded" className="rounded-4 h-[88px] w-full" />
          <Skeleton shape="rounded" className="rounded-4 h-[220px] w-full" />
          <Skeleton shape="rounded" className="rounded-4 h-[160px] w-full" />
        </div>
      </div>
    </div>
  );
}
