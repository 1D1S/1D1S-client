import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  NotificationPreferences,
  WebPushEndpointRequest,
} from '../type/notification';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
      });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
      });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationPreferences) =>
      notificationApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.preferences(),
      });
    },
  });
}

export function useRegisterEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WebPushEndpointRequest) =>
      notificationApi.registerEndpoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.endpoints(),
      });
    },
  });
}

export function useDeleteEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (endpointUrl: string) =>
      notificationApi.deleteEndpoint(endpointUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.endpoints(),
      });
    },
  });
}
