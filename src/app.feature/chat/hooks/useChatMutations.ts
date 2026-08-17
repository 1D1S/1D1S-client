'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { chatApi } from '../api/chatApi';
import { CHAT_QUERY_KEYS } from '../consts/queryKeys';
import { ChatRoomList } from '../type/chat';

/**
 * 방별 푸시 알림 토글 — 낙관적.
 *
 * 목록을 invalidate 하면 리스트 전체가 다시 그려지며 페이드가 걸린다. 종
 * 하나 눌렀을 뿐인데 화면이 깜빡이므로, 캐시의 그 방만 갈아 끼우고
 * 실패했을 때만 되돌린다.
 */
export function useToggleChatPush(): UseMutationResult<
  void,
  Error,
  { roomId: number; enabled: boolean },
  { previous?: ChatRoomList }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, enabled }) =>
      chatApi.setNotifications(roomId, enabled),
    onMutate: async ({ roomId, enabled }) => {
      await queryClient.cancelQueries({ queryKey: CHAT_QUERY_KEYS.rooms() });
      const previous = queryClient.getQueryData<ChatRoomList>(
        CHAT_QUERY_KEYS.rooms()
      );
      queryClient.setQueryData<ChatRoomList>(
        CHAT_QUERY_KEYS.rooms(),
        (cache) =>
          cache && {
            ...cache,
            rooms: cache.rooms.map((room) =>
              room.roomId === roomId
                ? { ...room, pushEnabled: enabled }
                : room
            ),
          }
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CHAT_QUERY_KEYS.rooms(), context.previous);
      }
    },
  });
}

/** 공지 지정 — 호스트만. 아니면 403 CHAT-009. */
export function useSetChatNotice(): UseMutationResult<
  void,
  Error,
  { roomId: number; messageId: number }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, messageId }) => chatApi.setNotice(roomId, messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.rooms(),
      });
    },
  });
}

export function useClearChatNotice(): UseMutationResult<
  void,
  Error,
  { roomId: number }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId }) => chatApi.clearNotice(roomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.rooms(),
      });
    },
  });
}
