'use client';

import { Text } from '@1d1s/design-system';
import { Bell } from 'lucide-react';

import { NotificationListItem } from '../components/NotificationListItem';
import { MOCK_NOTIFICATIONS } from '../consts/mockNotifications';
import { useMarkAllAsRead, useMarkAsRead } from '../hooks/useNotificationMutations';

export function NotificationScreen() {
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  // TODO: replace with useNotifications() once API is ready
  const notifications = MOCK_NOTIFICATIONS;
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
        <Text size="display1" weight="bold" className="text-gray-900">
          알림
        </Text>
        {hasUnread && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-blue-500 transition-colors hover:text-blue-600"
          >
            <Text size="caption1" weight="medium" className="text-inherit">
              모두 읽음
            </Text>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <Text size="body1" weight="regular" className="text-gray-400">
            아직 알림이 없습니다.
          </Text>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationListItem
                notification={notification}
                onRead={markAsRead}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
