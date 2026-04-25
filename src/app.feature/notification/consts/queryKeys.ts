import { NotificationListParams } from '../type/notification';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'] as const,
  list: (params?: NotificationListParams) =>
    [...NOTIFICATION_QUERY_KEYS.lists(), params] as const,
};