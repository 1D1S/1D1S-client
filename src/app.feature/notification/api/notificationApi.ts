import { apiClient } from '@module/api/client';

import {
  NotificationListParams,
  NotificationListResponse,
} from '../type/notification';

export const notificationApi = {
  getNotifications: async (
    params?: NotificationListParams
  ): Promise<NotificationListResponse> => {
    const response = await apiClient.get<NotificationListResponse>(
      '/notifications',
      { params }
    );
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
