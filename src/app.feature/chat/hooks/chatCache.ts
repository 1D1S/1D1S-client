import { InfiniteData, QueryClient } from '@tanstack/react-query';

import { CHAT_QUERY_KEYS } from '../consts/queryKeys';
import { ChatLinkPreview, ChatMessage, ChatMessagePage } from '../type/chat';

type MessageCache = InfiniteData<ChatMessagePage> | undefined;

/** 내역은 최신순이라 page 0 의 맨 앞이 가장 새 메시지다. */
function mapPages(
  cache: MessageCache,
  map: (items: ChatMessage[], pageIndex: number) => ChatMessage[]
): MessageCache {
  if (!cache) {
    return cache;
  }
  return {
    ...cache,
    pages: cache.pages.map((page, index) => ({
      ...page,
      items: map(page.items, index),
    })),
  };
}

function forEachMessage(
  cache: MessageCache,
  visit: (message: ChatMessage) => boolean
): boolean {
  return (cache?.pages ?? []).some((page) => page.items.some(visit));
}

function update(
  client: QueryClient,
  roomId: number,
  updater: (cache: MessageCache) => MessageCache
): void {
  client.setQueryData<InfiniteData<ChatMessagePage>>(
    CHAT_QUERY_KEYS.messages(roomId),
    (cache) => updater(cache) as InfiniteData<ChatMessagePage>
  );
}

/**
 * 브로드캐스트·REST 응답·낙관적 말풍선이 모두 지나는 한 곳.
 *
 * ① 같은 clientMessageId 의 내 낙관적 말풍선이 있으면 서버 확정본으로
 *    갈아 끼운다. ② 같은 id 가 이미 있으면(재연결 직후, REST 응답과
 *    브로드캐스트가 겹칠 때) 넣지 않는다. ③ 그 외에는 맨 앞에 붙인다.
 */
export function upsertChatMessage(
  client: QueryClient,
  roomId: number,
  message: ChatMessage
): void {
  update(client, roomId, (cache) => {
    if (!cache) {
      return cache;
    }
    const clientId = message.clientMessageId;
    const hasPending =
      clientId != null &&
      forEachMessage(
        cache,
        (item) => item.clientMessageId === clientId && Boolean(item.pending)
      );
    if (hasPending) {
      return mapPages(cache, (items) =>
        items.map((item) =>
          item.clientMessageId === clientId && item.pending ? message : item
        )
      );
    }
    const duplicated =
      message.id > 0 && forEachMessage(cache, (item) => item.id === message.id);
    if (duplicated) {
      return cache;
    }
    return mapPages(cache, (items, index) =>
      index === 0 ? [message, ...items] : items
    );
  });
}

/** 전송 실패 표시. 사용자가 탭해 다시 보낼 수 있다. */
export function markChatMessageFailed(
  client: QueryClient,
  roomId: number,
  clientMessageId: string
): void {
  update(client, roomId, (cache) =>
    mapPages(cache, (items) =>
      items.map((item) =>
        item.clientMessageId === clientMessageId && item.pending
          ? { ...item, pending: false, failed: true }
          : item
      )
    )
  );
}

/** 재전송 시작 — 실패 표시를 걷고 다시 보내는 중으로 되돌린다. */
export function markChatMessagePending(
  client: QueryClient,
  roomId: number,
  clientMessageId: string
): void {
  update(client, roomId, (cache) =>
    mapPages(cache, (items) =>
      items.map((item) =>
        item.clientMessageId === clientMessageId
          ? { ...item, pending: true, failed: false }
          : item
      )
    )
  );
}

/** 링크 프리뷰가 뒤늦게 왔다 — 그 말풍선만 갈아 끼운다. */
export function applyChatLinkPreview(
  client: QueryClient,
  roomId: number,
  messageId: number,
  linkPreview: ChatLinkPreview
): void {
  update(client, roomId, (cache) =>
    mapPages(cache, (items) =>
      items.map((item) =>
        item.id === messageId ? { ...item, linkPreview } : item
      )
    )
  );
}

/** 내역에서 그 메시지를 찾는다. 공지 본문을 세울 때 쓴다. */
export function findChatMessage(
  cache: MessageCache,
  messageId: number
): ChatMessage | null {
  for (const page of cache?.pages ?? []) {
    const found = page.items.find((item) => item.id === messageId);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * 끊긴 동안 온 메시지를 채운다. 토픽은 지나간 것을 다시 주지 않으므로
 * 재연결 시 최신 페이지를 받아 **없는 것만** 끼워 넣는다. 쌓인 페이지를
 * 통째로 다시 받지 않는다.
 */
export function mergeLatestMessages(
  client: QueryClient,
  roomId: number,
  latest: ChatMessage[]
): void {
  update(client, roomId, (cache) => {
    if (!cache) {
      return cache;
    }
    const known = new Set<number>();
    cache.pages.forEach((page) =>
      page.items.forEach((item) => {
        if (item.id > 0) {
          known.add(item.id);
        }
      })
    );
    const missing = latest.filter((item) => !known.has(item.id));
    if (missing.length === 0) {
      return cache;
    }
    return mapPages(cache, (items, index) =>
      index === 0
        ? [...missing, ...items].sort((left, right) =>
            right.createdAt.localeCompare(left.createdAt)
          )
        : items
    );
  });
}
