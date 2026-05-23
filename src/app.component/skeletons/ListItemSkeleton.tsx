import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import React from 'react';

interface NotificationItemSkeletonProps {
  className?: string;
  withActions?: boolean;
}

export function NotificationItemSkeleton({
  className,
  withActions = false,
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
      {withActions ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <Skeleton shape="rounded" className="h-7 w-12 rounded-lg" />
          <Skeleton shape="rounded" className="h-7 w-12 rounded-lg" />
        </div>
      ) : (
        <Skeleton shape="circle" className="mt-1.5 h-2 w-2 shrink-0" />
      )}
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
          <NotificationItemSkeleton withActions={index === 0} />
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

interface FriendRequestItemSkeletonProps {
  className?: string;
  actionCount?: 1 | 2;
}

export function FriendRequestItemSkeleton({
  className,
  actionCount = 2,
}: FriendRequestItemSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn('flex items-center gap-3 px-4 py-3', className)}
    >
      <Skeleton shape="circle" className="h-10 w-10 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton shape="text" className="h-4 w-28" />
        <Skeleton shape="text" className="h-3 w-20" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Skeleton shape="rounded" className="h-8 w-14 rounded-lg" />
        {actionCount === 2 ? (
          <Skeleton shape="rounded" className="h-8 w-14 rounded-lg" />
        ) : null}
      </div>
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

interface FriendRequestListSkeletonProps {
  count?: number;
  className?: string;
  actionCount?: 1 | 2;
}

export function FriendRequestListSkeleton({
  count = 4,
  className,
  actionCount = 2,
}: FriendRequestListSkeletonProps): React.ReactElement {
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
          <FriendRequestItemSkeleton actionCount={actionCount} />
        </React.Fragment>
      ))}
    </div>
  );
}
