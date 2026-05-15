import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

interface NotificationItemSkeletonProps {
  className?: string;
}

export function NotificationItemSkeleton({
  className,
}: NotificationItemSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3.5',
        className
      )}
    >
      <Skeleton shape="circle" className="h-9 w-9 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton shape="text" className="h-3.5 w-[85%]" />
        <Skeleton shape="text" className="h-3 w-[40%]" />
      </div>
    </div>
  );
}

interface NotificationListSkeletonProps {
  count?: number;
  className?: string;
}

export function NotificationListSkeleton({
  count = 6,
  className,
}: NotificationListSkeletonProps): React.ReactElement {
  return (
    <ul
      className={cn(
        'rounded-3 overflow-hidden border border-gray-200 bg-white',
        'divide-y divide-gray-100',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <NotificationItemSkeleton />
        </li>
      ))}
    </ul>
  );
}

interface FriendItemSkeletonProps {
  className?: string;
}

export function FriendItemSkeleton({
  className,
}: FriendItemSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn('flex items-center gap-3 px-4 py-3', className)}
    >
      <Skeleton shape="circle" className="h-10 w-10 shrink-0" />
      <Skeleton shape="text" className="h-4 w-32 flex-1" />
      <Skeleton shape="pill" className="h-8 w-16 shrink-0" />
    </div>
  );
}

interface FriendListSkeletonProps {
  count?: number;
  className?: string;
}

export function FriendListSkeleton({
  count = 5,
  className,
}: FriendListSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'overflow-hidden border-y border-gray-100 bg-white',
        'lg:rounded-[14px] lg:border',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <div className="ml-16 h-px bg-gray-100" /> : null}
          <FriendItemSkeleton />
        </React.Fragment>
      ))}
    </div>
  );
}
