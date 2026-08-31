import { apiClient, silentAuthClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import {
  MarkTargetAsReadParams,
  NotificationListData,
  NotificationListParams,
  NotificationPreferences,
  UnreadCount,
} from '../type/notification';

export const notificationApi = {
  getNotifications: async (
    params?: NotificationListParams
  ): Promise<NotificationListData> =>
    requestData<NotificationListData>(apiClient, {
      url: '/notifications',
      method: 'GET',
      params,
    }),

  // silentAuthClient: 401 시 logout 흐름을 트리거하지 않음 (헤더 뱃지 전용)
  getUnreadCount: async (): Promise<UnreadCount> =>
    requestData<UnreadCount>(silentAuthClient, {
      url: '/notifications/unread-count',
      method: 'GET',
    }),

  getPreferences: async (): Promise<NotificationPreferences> =>
    requestData<NotificationPreferences>(apiClient, {
      url: '/notifications/preferences',
      method: 'GET',
    }),

  updatePreferences: async (
    data: NotificationPreferences
  ): Promise<NotificationPreferences> =>
    requestData<NotificationPreferences, NotificationPreferences>(apiClient, {
      url: '/notifications/preferences',
      method: 'PUT',
      data,
    }),

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // 엔티티 단위 읽음 처리(상세 진입 트리거). 바디 없이 쿼리스트링만 보낸다.
  // 멱등이라 진입마다 호출해도 되고, 0건이어도 200 이다. 응답 data 는 처리
  // 후 남은 **전체** 미읽음 수라 헤더 뱃지에 그대로 넣을 수 있다.
  markTargetAsRead: async ({
    targetType,
    targetId,
  }: MarkTargetAsReadParams): Promise<UnreadCount> =>
    requestData<UnreadCount>(apiClient, {
      url: '/notifications/read',
      method: 'PATCH',
      params: { targetType, targetId },
    }),

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
