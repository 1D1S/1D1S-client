import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { CHAT_QUERY_KEYS } from '../consts/queryKeys';
import { ChatMessage, ChatMessagePage } from '../type/chat';
import { chatShareLinkIn, trimUrlTail } from '../utils/chatShareLink';
import { mergeLatestMessages, upsertChatMessage } from './chatCache';

const ROOM_ID = 7;

function message(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: 0,
    roomId: ROOM_ID,
    senderId: 1,
    senderNickname: '나',
    clientMessageId: null,
    type: 'TEXT',
    content: '안녕',
    imageUrl: null,
    status: 'ACTIVE',
    createdAt: '2026-08-17T10:00:00',
    ...overrides,
  };
}

function seed(items: ChatMessage[]): QueryClient {
  const client = new QueryClient();
  client.setQueryData(CHAT_QUERY_KEYS.messages(ROOM_ID), {
    pages: [{ items, pageInfo: { hasNextPage: false } }],
    pageParams: [null],
  });
  return client;
}

function read(client: QueryClient): ChatMessage[] {
  const cache = client.getQueryData<{ pages: ChatMessagePage[] }>(
    CHAT_QUERY_KEYS.messages(ROOM_ID)
  );
  return cache?.pages.flatMap((page) => page.items) ?? [];
}

describe('upsertChatMessage', () => {
  it('같은 clientMessageId 의 낙관적 말풍선을 확정본으로 교체한다', () => {
    const client = seed([
      message({ id: 0, clientMessageId: 'abc', pending: true }),
    ]);

    upsertChatMessage(
      client,
      ROOM_ID,
      message({ id: 91, clientMessageId: 'abc' })
    );

    const items = read(client);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(91);
    expect(items[0].pending).toBeUndefined();
  });

  it('REST 응답과 브로드캐스트가 겹쳐도 같은 id 를 두 번 넣지 않는다', () => {
    const client = seed([message({ id: 91, clientMessageId: 'abc' })]);

    upsertChatMessage(
      client,
      ROOM_ID,
      message({ id: 91, clientMessageId: 'abc' })
    );

    expect(read(client)).toHaveLength(1);
  });

  it('새 메시지는 맨 앞(최신)에 붙인다', () => {
    const client = seed([message({ id: 10 })]);

    upsertChatMessage(client, ROOM_ID, message({ id: 11 }));

    expect(read(client).map((item) => item.id)).toEqual([11, 10]);
  });
});

describe('mergeLatestMessages', () => {
  it('끊긴 동안 온 것만 끼워 넣고 최신순을 유지한다', () => {
    const client = seed([
      message({ id: 10, createdAt: '2026-08-17T10:00:00' }),
    ]);

    mergeLatestMessages(client, ROOM_ID, [
      message({ id: 12, createdAt: '2026-08-17T10:02:00' }),
      message({ id: 10, createdAt: '2026-08-17T10:00:00' }),
      message({ id: 11, createdAt: '2026-08-17T10:01:00' }),
    ]);

    expect(read(client).map((item) => item.id)).toEqual([12, 11, 10]);
  });
});

describe('chatShareLinkIn', () => {
  it('통째로 우리 공유 링크 하나일 때만 알아본다', () => {
    expect(chatShareLinkIn('https://1day1streak.com/challenge/12')).toBe(
      'https://1day1streak.com/challenge/12'
    );
    expect(chatShareLinkIn('https://dev.1day1streak.com/diary/3')).toBe(
      'https://dev.1day1streak.com/diary/3'
    );
    // 글 중간에 섞인 링크는 건드리지 않는다 — 하고 싶던 말이 사라진다.
    expect(chatShareLinkIn('이거 봐 https://1day1streak.com/diary/3')).toBeNull();
    expect(chatShareLinkIn('https://1day1streak.com/mypage')).toBeNull();
    expect(chatShareLinkIn('https://example.com/challenge/12')).toBeNull();
  });
});

describe('trimUrlTail', () => {
  it('주소 끝에 붙은 문장부호를 떼되 짝지은 괄호는 남긴다', () => {
    expect(trimUrlTail('https://a.com/x.')).toBe('https://a.com/x');
    expect(trimUrlTail('https://a.com/x(y)')).toBe('https://a.com/x(y)');
  });
});
