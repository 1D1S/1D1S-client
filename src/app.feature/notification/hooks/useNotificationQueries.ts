import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  NotificationEndpoint,
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

export function useUnreadCount(): UseQueryResult<UnreadCount, Error> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
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

export function useNotificationEndpoints(): UseQueryResult<
  NotificationEndpoint[],
  Error
> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.endpoints(),
    queryFn: () => notificationApi.getEndpoints(),
  });
}
