'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { chatApi } from '../api/chatApi';
import { CHAT_QUERY_KEYS } from '../consts/queryKeys';
import {
  blocksMessages,
  ChatRoomHandlers,
  subscribeChatRoom,
} from '../socket/chatSocket';
import {
  ChatMessage,
  ChatMessageType,
  ChatReadState,
  ChatShareResolution,
  ChatSocketError,
} from '../type/chat';
import {
  applyChatLinkPreview,
  markChatMessageFailed,
  markChatMessagePending,
  mergeLatestMessages,
  upsertChatMessage,
} from './chatCache';
import { useChatMessages } from './useChatQueries';

/** 구독이 거절됐을 때 화면에 세울 문구. */
function subscriptionMessage(
  error: ChatSocketError,
  challengeEnded: boolean
): string {
  switch (error.code) {
    case 'CHAT-002':
      // 종료된 챌린지 방은 "참여하고 있지 않다" 가 아니다 — 호스트로 멀쩡히
      // 남아 있어도 종료되면 막힐 수 있다.
      return challengeEnded
        ? '종료된 챌린지라 새 메시지를 받을 수 없습니다.'
        : '이 채팅방에 참여하고 있지 않아 새 메시지를 받을 수 없습니다.';
    case 'UNAUTHORIZED':
    case 'AUTH-010':
      return '로그인이 만료되어 실시간 연결이 끊겼습니다.';
    case 'CHAT-015':
      return '접속이 몰려 잠시 후 다시 연결합니다.';
    default:
      return `${error.message} 새 메시지는 실시간으로 오지 않습니다.`;
  }
}

interface SendOptions {
  type: ChatMessageType;
  content?: string;
  imageUploadId?: string;
  sharedTargetId?: number;
}

export interface UseChatRoomResult {
  messages: ChatMessage[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage(): void;
  /** 실시간 수신이 끊겼다는 안내. 내역은 그대로 볼 수 있다. */
  subscriptionError: string | null;
  /** 서버가 방에서 빠졌다고 답했다(CHAT-002) — 입력창도 닫는다. */
  kickedOut: boolean;
  /** 실시간으로 받은 공지 id. null 이면 해제, undefined 면 통지 없음. */
  noticeUpdate: number | null | undefined;
  /** 방 멤버 전원의 읽음 위치. 메시지별 안 읽은 수를 여기서 센다. */
  readStates: ChatReadState[];
  sendText(content: string): Promise<void>;
  sendImage(file: File, caption?: string): Promise<void>;
  sendShare(
    resolution: ChatShareResolution,
    caption?: string
  ): Promise<void>;
  retry(message: ChatMessage): Promise<void>;
}

/**
 * 방 하나의 화면 상태. 내역(커서 페이징) + 실시간 수신 + 낙관적 전송.
 *
 * 전송은 REST 다(계약 A). 소켓 SEND 와 달리 실패가 응답으로 바로 돌아오고,
 * 소켓이 아직 안 붙었어도 나간다 — 대기열·재전송 타이머가 필요 없다.
 * 응답과 브로드캐스트가 두 번 도착하지만 clientMessageId 로 합쳐진다.
 */
export function useChatRoom(
  roomId: number,
  options: { myMemberId?: number; challengeEnded?: boolean } = {}
): UseChatRoomResult {
  const { myMemberId, challengeEnded = false } = options;
  const queryClient = useQueryClient();
  const query = useChatMessages(roomId);
  const [socketError, setSocketError] = useState<ChatSocketError | null>(null);
  const [noticeUpdate, setNoticeUpdate] = useState<number | null | undefined>(
    undefined
  );
  const [readStates, setReadStates] = useState<ChatReadState[]>([]);
  /** 서버에 올린 마지막 읽음 위치. 같은 값을 반복해 올리지 않는다. */
  const lastReadSent = useRef(0);

  const messages = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  const markRead = useCallback(
    (messageId: number) => {
      if (messageId <= 0 || messageId <= lastReadSent.current) {
        return;
      }
      lastReadSent.current = messageId;
      chatApi
        .markRead(roomId, messageId)
        .then(() =>
          queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.rooms() })
        )
        .catch(() => {
          // 실패하면 다음 메시지에서 다시 시도할 수 있게 되돌린다.
          if (lastReadSent.current === messageId) {
            lastReadSent.current = 0;
          }
        });
    },
    [queryClient, roomId]
  );

  // 방에 들어갈 때 읽음 위치를 한 번 받아 둔다. 이후 갱신은 /read 구독이
  // 한 줄씩 실어 온다 — 여기서 주기적으로 다시 받지 않는다.
  useEffect(() => {
    if (!Number.isFinite(roomId) || roomId <= 0) {
      return undefined;
    }
    let alive = true;
    chatApi
      .getReadStates(roomId)
      .then((states) => {
        if (alive) {
          setReadStates(states.members);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [roomId]);

  // 방을 열었으면 거기까지는 읽은 것이다. 최신순이라 첫 항목이 최신.
  const latestId = messages.find((message) => message.id > 0)?.id ?? 0;
  useEffect(() => {
    markRead(latestId);
  }, [latestId, markRead]);

  // 실시간 콜백은 매 렌더 바뀌지만 구독은 방마다 한 번만 건다. 최신 콜백을
  // ref 로 들고 있어 재구독 없이 최신 상태를 본다.
  const handlersRef = useRef<ChatRoomHandlers>({});
  useEffect(() => {
    handlersRef.current = {
      onMessage: (message) => {
        upsertChatMessage(queryClient, roomId, message);
        setSocketError(null);
      },
      onNotice: (update) => {
        if (update.systemMessage) {
          upsertChatMessage(queryClient, roomId, update.systemMessage);
        }
        setNoticeUpdate(update.noticeMessageId ?? null);
        // 내 내역에 없는 옛 메시지를 공지로 걸었으면 방 목록이 실어다 준다.
        void queryClient.invalidateQueries({
          queryKey: CHAT_QUERY_KEYS.rooms(),
        });
      },
      onUpdate: (update) => {
        if (update.linkPreview) {
          applyChatLinkPreview(
            queryClient,
            roomId,
            update.messageId,
            update.linkPreview
          );
        }
      },
      onError: (error) => {
        // 곁가지 채널(/notice·/updates)이 막힌 건 메시지 수신과 무관하다.
        // 그걸로 "새 메시지가 안 온다" 배너를 세우면 거짓말이다.
        if (!blocksMessages(error)) {
          return;
        }
        setSocketError(error);
      },
      onRead: (receipt) => {
        // 한 줄만 갈아 끼운다. 위치는 앞으로만 간다는 계약이지만, 순서가
        // 뒤바뀌어 도착해도 뒤로 밀리지 않게 막는다.
        setReadStates((current) => {
          const next = current.filter(
            (state) => state.memberId !== receipt.memberId
          );
          const before = current.find(
            (state) => state.memberId === receipt.memberId
          );
          const previous = before?.lastReadMessageId ?? -1;
          const incoming = receipt.lastReadMessageId ?? -1;
          next.push(
            incoming > previous
              ? {
                  memberId: receipt.memberId,
                  lastReadMessageId: receipt.lastReadMessageId,
                }
              : (before ?? {
                  memberId: receipt.memberId,
                  lastReadMessageId: receipt.lastReadMessageId,
                })
          );
          return next;
        });
      },
      onReconnect: () => {
        chatApi
          .getMessages(roomId)
          .then((page) => mergeLatestMessages(queryClient, roomId, page.items))
          .catch(() => undefined);
        // 끊긴 동안의 읽음 통지는 다시 오지 않는다 — 위치를 통째로 다시 받는다.
        chatApi
          .getReadStates(roomId)
          .then((states) => setReadStates(states.members))
          .catch(() => undefined);
      },
    };
  }, [queryClient, roomId]);

  useEffect(() => {
    if (!Number.isFinite(roomId) || roomId <= 0) {
      return undefined;
    }
    return subscribeChatRoom(roomId, {
      onMessage: (message) => handlersRef.current.onMessage?.(message),
      onNotice: (update) => handlersRef.current.onNotice?.(update),
      onUpdate: (update) => handlersRef.current.onUpdate?.(update),
      onRead: (receipt) => handlersRef.current.onRead?.(receipt),
      onError: (error) => handlersRef.current.onError?.(error),
      onReconnect: () => handlersRef.current.onReconnect?.(),
    });
  }, [roomId]);

  const send = useCallback(
    async (
      clientMessageId: string,
      optimistic: ChatMessage,
      resolve: () => Promise<SendOptions>
    ) => {
      upsertChatMessage(queryClient, roomId, optimistic);
      try {
        const options = await resolve();
        const sent = await chatApi.sendMessage(roomId, {
          clientMessageId,
          ...options,
        });
        upsertChatMessage(queryClient, roomId, sent);
      } catch (error) {
        markChatMessageFailed(queryClient, roomId, clientMessageId);
        throw error;
      }
    },
    [queryClient, roomId]
  );

  const optimisticMessage = useCallback(
    (
      clientMessageId: string,
      type: ChatMessageType,
      content?: string
    ): ChatMessage => ({
      id: 0,
      roomId,
      // 내 id 로 채운다 — 화면이 senderId 로 좌우를 가르므로 낙관적
      // 말풍선도 같은 기준을 따라야 보내는 순간부터 오른쪽에 선다.
      senderId: myMemberId ?? 0,
      senderNickname: '',
      clientMessageId,
      type,
      content: content ?? null,
      imageUrl: null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      pending: true,
    }),
    [myMemberId, roomId]
  );

  const sendText = useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content) {
        return;
      }
      const clientMessageId = crypto.randomUUID();
      await send(
        clientMessageId,
        optimisticMessage(clientMessageId, 'TEXT', content),
        async () => ({ type: 'TEXT', content })
      );
    },
    [optimisticMessage, send]
  );

  const sendImage = useCallback(
    async (file: File, caption?: string) => {
      const clientMessageId = crypto.randomUUID();
      await send(
        clientMessageId,
        optimisticMessage(clientMessageId, 'IMAGE', caption),
        async () => ({
          type: 'IMAGE',
          content: caption?.trim() || undefined,
          imageUploadId: await chatApi.uploadImage(roomId, file),
        })
      );
    },
    [optimisticMessage, roomId, send]
  );

  const sendShare = useCallback(
    async (resolution: ChatShareResolution, caption?: string) => {
      const type = resolution.type;
      const targetId = resolution.targetId;
      if (!type || targetId == null) {
        return;
      }
      const clientMessageId = crypto.randomUUID();
      const optimistic = optimisticMessage(clientMessageId, type, caption);
      await send(
        clientMessageId,
        { ...optimistic, share: resolution.share ?? null },
        async () => ({
          type,
          content: caption?.trim() || undefined,
          sharedTargetId: targetId,
        })
      );
    },
    [optimisticMessage, send]
  );

  const retry = useCallback(
    async (message: ChatMessage) => {
      const clientMessageId = message.clientMessageId;
      // 글만 다시 보낼 수 있다. 사진은 업로드 식별자가, 공유는 대상 id 가
      // 낙관적 말풍선에 남아 있지 않아 다시 고르는 편이 정확하다.
      if (!clientMessageId || message.type !== 'TEXT' || !message.content) {
        return;
      }
      markChatMessagePending(queryClient, roomId, clientMessageId);
      try {
        // clientMessageId 를 그대로 쓰므로 서버 unique 제약이 중복을 막는다.
        const sent = await chatApi.sendMessage(roomId, {
          clientMessageId,
          type: 'TEXT',
          content: message.content,
        });
        upsertChatMessage(queryClient, roomId, sent);
      } catch (error) {
        markChatMessageFailed(queryClient, roomId, clientMessageId);
        throw error;
      }
    },
    [queryClient, roomId]
  );

  return {
    messages,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    subscriptionError: socketError
      ? subscriptionMessage(socketError, challengeEnded)
      : null,
    kickedOut: socketError?.code === 'CHAT-002',
    noticeUpdate,
    readStates,
    sendText,
    sendImage,
    sendShare,
    retry,
  };
}
