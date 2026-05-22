'use client';

import { Text } from '@1d1s/design-system';
import { NotificationListSkeleton } from '@component/skeletons/ListItemSkeleton';
import { useInViewObserver } from '@module/hooks/useInViewObserver';
import { cn } from '@module/utils/cn';
import { ArrowLeft, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';

import { NotificationListItem } from '../components/NotificationListItem';
import {
  useMarkAllAsRead,
  useMarkAsRead,
} from '../hooks/useNotificationMutations';
import { useNotificationsInfinite } from '../hooks/useNotificationQueries';
import { Notification } from '../type/notification';

export function NotificationScreen(): React.JSX.Element {
  const router = useRouter();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsInfinite();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { ref, inView } = useInViewObserver();

  const notifications = useMemo<Notification[]>(() => {
    const flattened = data?.pages?.flatMap((page) => page?.items ?? []) ?? [];
    const map = new Map<number, Notification>();
    flattened.forEach((notif) => {
      map.set(notif.id, notif);
    });
    return Array.from(map.values());
  }, [data]);

  const hasUnread = notifications.some((notif) => !notif.isRead);
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen w-full">
      {/* 모바일 sticky 헤더 — ← + 알림 + 모두 읽음 */}
      <div
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3',
          'h-14-safe pt-safe-top',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden',
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100',
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          알림
        </Text>
        {hasUnread && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-main-800 hover:text-main-900 transition-colors"
          >
            <Text size="caption1" weight="medium" className="text-inherit">
              모두 읽음
            </Text>
          </button>
        )}
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-[1200px]',
          'px-5 py-5 lg:px-8 lg:py-10',
        )}
      >
        <header
          className={cn(
            'hidden flex-col gap-4 border-b border-gray-100 pb-5',
            'lg:flex lg:flex-row lg:items-end lg:justify-between',
          )}
        >
          <div className="flex flex-col gap-1.5">
            <Text
              size="pageTitle"
              weight="extrabold"
              className="tracking-tight text-gray-900"
            >
              알림
            </Text>
            <Text size="body2" weight="regular" className="text-gray-500">
              {hasUnread
                ? `읽지 않은 알림이 ${unreadCount}개 있어요.`
                : '받은 알림을 모두 확인했어요.'}
            </Text>
          </div>
          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className={cn(
                'text-main-800 hover:text-main-900 transition-colors',
                'self-end',
              )}
            >
              <Text size="body2" weight="medium" className="text-inherit">
                모두 읽음
              </Text>
            </button>
          )}
        </header>

        {isLoading ? (
          <NotificationListSkeleton count={6} className="mt-6" />
        ) : !hasNotifications ? (
          <div
            className={cn(
              'mt-6 flex flex-col items-center justify-center gap-4',
              'rounded-3 border border-gray-200 bg-white py-16',
            )}
          >
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center',
                'bg-main-200/60 text-main-800 rounded-full',
              )}
            >
              <Bell className="h-8 w-8" />
            </div>
            <Text size="body1" weight="medium" className="text-gray-500">
              아직 받은 알림이 없습니다.
            </Text>
          </div>
        ) : (
          <>
            <ul
              className={cn(
                'rounded-3 data-fade-in mt-6 overflow-hidden',
                'border border-gray-200 bg-white',
                'divide-y divide-gray-100',
              )}
            >
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationListItem
                    notification={notification}
                    onRead={markAsRead}
                  />
                </li>
              ))}
            </ul>

            {isFetchingNextPage ? (
              <NotificationListSkeleton count={3} className="mt-3" />
            ) : null}

            <div
              ref={ref}
              className="mt-6 flex h-10 w-full items-center justify-center"
            >
              {!isFetchingNextPage && !hasNextPage ? (
                <Text size="body2" className="text-gray-400">
                  마지막 알림입니다.
                </Text>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
