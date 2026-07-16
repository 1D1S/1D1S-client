'use client';

import { Text } from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import { NotificationListSkeleton } from '@component/skeletons/ListItemSkeleton';
import { useInfiniteScroll } from '@module/hooks/useInfiniteScroll';
import { useSafeBack } from '@module/hooks/useSafeBack';
import { cn } from '@module/utils/cn';
import { useMinimumLoading } from '@module/utils/useMinimumLoading';
import { Bell } from 'lucide-react';
import React, { useMemo } from 'react';

import { NotificationListItem } from '../components/NotificationListItem';
import {
  useMarkAllAsRead,
  useMarkAsRead,
} from '../hooks/useNotificationMutations';
import { useNotificationsInfinite } from '../hooks/useNotificationQueries';
import { Notification } from '../type/notification';

export function NotificationScreen(): React.JSX.Element {
  const handleBack = useSafeBack('/');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotificationsInfinite();
  const showSkeleton = useMinimumLoading(isLoading);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { ref } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

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

  const markAllAction = hasUnread ? (
    <button
      type="button"
      onClick={() => markAllAsRead()}
      className="text-main-800 hover:text-main-900 transition-colors"
    >
      <Text size="body2" weight="medium" className="text-inherit">
        모두 읽음
      </Text>
    </button>
  ) : null;

  const description = hasUnread
    ? `읽지 않은 알림이 ${unreadCount}개 있어요.`
    : '받은 알림을 모두 확인했어요.';

  return (
    <SubPageShell
      title="알림"
      description={description}
      headerAction={markAllAction}
      onBack={handleBack}
    >
      {/* 네이티브 쉘에서는 SubPageShell 의 웹 헤더(와 headerAction 의
          "모두 읽음")가 통째로 숨는다. 같은 액션을 본문 상단에 native-only
          로 한 번 더 그려 네이티브에서도 모두 읽음이 가능하게 한다. */}
      {hasUnread ? (
        <div className="native-only mb-3 text-right">{markAllAction}</div>
      ) : null}
      {showSkeleton ? (
        <NotificationListSkeleton count={6} />
      ) : !hasNotifications ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4',
            'rounded-3 border border-gray-200 bg-white py-16'
          )}
        >
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center',
              'bg-main-200/60 text-main-800 rounded-full'
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
              'rounded-3 data-fade-in overflow-hidden',
              'border border-gray-200 bg-white',
              'divide-y divide-gray-100'
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
    </SubPageShell>
  );
}
