import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  NotificationListParams,
  NotificationListResponse,
} from '../type/notification';

export function useNotifications(
  params?: NotificationListParams
): UseQueryResult<NotificationListResponse, Error> {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notificationApi.getNotifications(params),
  });
}
