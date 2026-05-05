import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  NotificationListData,
  NotificationListParams,
  NotificationPreferences,
  UnreadCount,
} from '../type/notification';

export function useNotifications(
  params?: NotificationListParams
): UseQueryResult<NotificationListData, Error> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notificationApi.getNotifications(params),
  });
}

export function useUnreadCount(
  options?: { enabled?: boolean }
): UseQueryResult<UnreadCount, Error> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: options?.enabled ?? true,
    retry: false,
    throwOnError: false,
  });
}

export function useNotificationPreferences(): UseQueryResult<
  NotificationPreferences,
  Error
> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences(),
    queryFn: () => notificationApi.getPreferences(),
  });
}

