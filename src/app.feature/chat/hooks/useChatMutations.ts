'use client';

import type { QueryKey, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { chatApi } from '../api/chatApi';
import { CHAT_QUERY_KEYS } from '../consts/queryKeys';
import { ChatReportRequest, ChatRoomList } from '../type/chat';

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
  { previous: Array<[QueryKey, ChatRoomList | undefined]> }
> {
  const queryClient = useQueryClient();
  // 목록은 archived 필터별로 따로 캐시된다(전체·진행 중·아카이브). 한 갈래만
  // 고치면 필터를 바꿨을 때 종이 도로 뒤집힌 것처럼 보인다 — 전부 손본다.
  const filter = { queryKey: CHAT_QUERY_KEYS.rooms() };
  return useMutation({
    mutationFn: ({ roomId, enabled }) =>
      chatApi.setNotifications(roomId, enabled),
    onMutate: async ({ roomId, enabled }) => {
      await queryClient.cancelQueries(filter);
      const previous =
        queryClient.getQueriesData<ChatRoomList>(filter);
      queryClient.setQueriesData<ChatRoomList>(
        filter,
        (cache) =>
          cache && {
            ...cache,
            rooms: cache.rooms.map((room) =>
              room.roomId === roomId ? { ...room, pushEnabled: enabled } : room
            ),
          }
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
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

/**
 * 메시지 신고. 서버는 접수(PENDING)만 하고 메시지를 곧바로 가리지 않으므로
 * 캐시를 건드리지 않는다 — 숨김(HIDDEN)은 관리자가 승인했을 때 브로드캐스트/
 * 재조회로 따라 들어온다.
 */
export function useReportChatMessage(): UseMutationResult<
  void,
  Error,
  { messageId: number; data: ChatReportRequest }
> {
  return useMutation({
    mutationFn: ({ messageId, data }) =>
      chatApi.reportMessage(messageId, data),
    // 신고 실패는 사유가 갈린다(중복 CHAT-010 / 한도 CHAT-013) — 호출부가
    // 코드를 보고 문구를 정한다. 전역 토스트가 먼저 끼어들지 않게 한다.
    meta: { skipGlobalErrorToast: true },
  });
}
