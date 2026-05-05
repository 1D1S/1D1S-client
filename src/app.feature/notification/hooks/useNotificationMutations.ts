import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  NotificationEndpoint,
  NotificationPreferences,
  WebPushEndpointRequest,
} from '../type/notification';

interface PrefContext { previous: NotificationPreferences | undefined }

export function useMarkAsRead(): UseMutationResult<void, Error, number> {
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

export function useMarkAllAsRead(): UseMutationResult<void, Error, void> {
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

export function useUpdateNotificationPreferences(): UseMutationResult<
  NotificationPreferences,
  Error,
  NotificationPreferences,
  PrefContext
> {
  const queryClient = useQueryClient();
  const prefKey = NOTIFICATION_QUERY_KEYS.preferences();

  return useMutation({
    mutationFn: (data: NotificationPreferences) =>
      notificationApi.updatePreferences(data),
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: prefKey });
      const previous =
        queryClient.getQueryData<NotificationPreferences>(prefKey);
      queryClient.setQueryData(prefKey, newPrefs);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(prefKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prefKey });
    },
  });
}

export function useRegisterEndpoint(): UseMutationResult<
  NotificationEndpoint,
  Error,
  WebPushEndpointRequest
> {
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
