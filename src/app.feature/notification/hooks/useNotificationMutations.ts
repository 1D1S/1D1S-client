import {
  InfiniteData,
  QueryKey,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import { NOTIFICATION_QUERY_KEYS } from '../consts/queryKeys';
import {
  MarkTargetAsReadParams,
  NotificationEndpoint,
  NotificationListData,
  NotificationPreferences,
  UnreadCount,
  WebPushEndpointRequest,
} from '../type/notification';

interface PrefContext {
  previous: NotificationPreferences | undefined;
}

type NotificationListSnapshot = Array<
  [QueryKey, InfiniteData<NotificationListData> | undefined]
>;

interface MarkAsReadContext {
  prevLists: NotificationListSnapshot;
  prevUnread: UnreadCount | undefined;
}

// 알림 클릭 직후 router.push 로 화면이 언마운트되면 onSuccess 의 캐시
// 무효화가 실행되지 않아 읽음 상태가 반영되지 않는다. onMutate 에서
// 네비게이션 이전에 캐시를 낙관적으로 갱신해 목록·뱃지에 즉시 읽음
// 처리가 보이도록 한다.
export function useMarkAsRead(): UseMutationResult<
  void,
  Error,
  number,
  MarkAsReadContext
> {
  const queryClient = useQueryClient();
  const listsKey = NOTIFICATION_QUERY_KEYS.lists();
  const unreadKey = NOTIFICATION_QUERY_KEYS.unreadCount();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: listsKey });
      await queryClient.cancelQueries({ queryKey: unreadKey });

      const prevLists = queryClient.getQueriesData<
        InfiniteData<NotificationListData>
      >({ queryKey: listsKey });
      const prevUnread = queryClient.getQueryData<UnreadCount>(unreadKey);

      let wasUnread = false;
      queryClient.setQueriesData<InfiniteData<NotificationListData>>(
        { queryKey: listsKey },
        (data) => {
          if (!data) {
            return data;
          }
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (item.id !== notificationId) {
                  return item;
                }
                if (!item.isRead) {
                  wasUnread = true;
                }
                return { ...item, isRead: true };
              }),
            })),
          };
        }
      );

      if (wasUnread) {
        queryClient.setQueryData<UnreadCount>(unreadKey, (prev) =>
          prev ? { unreadCount: Math.max(0, prev.unreadCount - 1) } : prev
        );
      }

      return { prevLists, prevUnread };
    },
    onError: (_err, _id, context) => {
      context?.prevLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context) {
        queryClient.setQueryData(unreadKey, context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listsKey });
      queryClient.invalidateQueries({ queryKey: unreadKey });
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
  return useMutation({
    mutationFn: (data: WebPushEndpointRequest) =>
      notificationApi.registerEndpoint(data),
  });
}

/**
 * 엔티티 단위 읽음 처리(상세 진입). 응답이 처리 후 남은 **전체** 미읽음
 * 수라, 헤더 뱃지 쿼리에 그대로 써넣고 목록은 무효화한다.
 *
 * 낙관적 갱신을 하지 않는다 — 이 상세에 걸린 알림이 몇 건인지 클라가 알 수
 * 없어 미리 뺄 수가 없다. 서버가 정확한 수를 돌려주므로 응답으로 덮는다.
 *
 * 읽음 처리는 부가기능이라 실패해도 조용히 넘어간다(skipGlobalErrorToast).
 * 상세 화면 표시를 막지 않는 게 우선이다.
 */
export function useMarkTargetAsRead(): UseMutationResult<
  UnreadCount,
  Error,
  MarkTargetAsReadParams
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkTargetAsReadParams) =>
      notificationApi.markTargetAsRead(params),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData<UnreadCount>(
          NOTIFICATION_QUERY_KEYS.unreadCount(),
          data
        );
      }
      // 목록을 열면 읽음이 반영돼 보이도록. 뱃지와 달리 목록은 서버가 준
      // 카운트로 대체할 수 없어 무효화로 다시 받는다.
      void queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.lists(),
      });
    },
  });
}
