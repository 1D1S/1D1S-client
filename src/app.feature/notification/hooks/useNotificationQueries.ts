import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  NotificationListData,
  NotificationListParams,
  NotificationPreferences,
  UnreadCount,
} from '../type/notification';

const EMPTY_UNREAD_COUNT: UnreadCount = { unreadCount: 0 };

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
    // 헤더 뱃지 전용. 세션 만료/302 redirect 로 응답이 envelope 형태가 아니거나
    // silent client 가 401 을 던지는 경우, 토스트로 새는 일이 없도록 query 단에서
    // 흡수하고 항상 0건으로 폴백한다. (useSidebar 의 forceLogout 흐름이 별도로
    // 진짜 세션 정리를 담당)
    queryFn: async () => {
      try {
        const data = await notificationApi.getUnreadCount();
        return data ?? EMPTY_UNREAD_COUNT;
      } catch {
        return EMPTY_UNREAD_COUNT;
      }
    },
    enabled: options?.enabled ?? true,
    retry: false,
    throwOnError: false,
  });
}

export function useNotificationPreferences(
  options?: { enabled?: boolean }
): UseQueryResult<NotificationPreferences, Error> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences(),
    queryFn: () => notificationApi.getPreferences(),
    enabled: options?.enabled ?? true,
  });
}

