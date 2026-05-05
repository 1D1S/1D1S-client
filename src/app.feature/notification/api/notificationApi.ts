import { apiClient, silentAuthClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import {
  NotificationEndpoint,
  NotificationListData,
  NotificationListParams,
  NotificationPreferences,
  UnreadCount,
  WebPushEndpointRequest,
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

  getWebPushPublicKey: async (): Promise<{ publicKey: string }> =>
    requestData<{ publicKey: string }>(apiClient, {
      url: '/notifications/web-push/public-key',
      method: 'GET',
    }),

  registerEndpoint: async (
    data: WebPushEndpointRequest
  ): Promise<NotificationEndpoint> =>
    requestData<NotificationEndpoint, WebPushEndpointRequest>(apiClient, {
      url: '/notifications/endpoints',
      method: 'POST',
      data,
    }),

  getEndpoints: async (): Promise<NotificationEndpoint[]> =>
    requestData<NotificationEndpoint[]>(apiClient, {
      url: '/notifications/endpoints',
      method: 'GET',
    }),

  deleteEndpoint: async (endpointUrl: string): Promise<void> => {
    await apiClient.delete('/notifications/endpoints', {
      data: { endpointUrl },
    });
  },

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

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
