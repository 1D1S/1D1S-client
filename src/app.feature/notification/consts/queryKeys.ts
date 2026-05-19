import { NotificationListParams } from '../type/notification';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'] as const,
  list: (params?: NotificationListParams) =>
    [...NOTIFICATION_QUERY_KEYS.lists(), params] as const,
  unreadCount: () =>
    [...NOTIFICATION_QUERY_KEYS.all, 'unread-count'] as const,
  preferences: () =>
    [...NOTIFICATION_QUERY_KEYS.all, 'preferences'] as const,
  endpoints: () => [...NOTIFICATION_QUERY_KEYS.all, 'endpoints'] as const,
};
