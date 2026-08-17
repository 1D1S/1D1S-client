export const CHAT_QUERY_KEYS = {
  all: ['chat'] as const,
  rooms: () => [...CHAT_QUERY_KEYS.all, 'rooms'] as const,
  messages: (roomId: number) =>
    [...CHAT_QUERY_KEYS.all, 'messages', roomId] as const,
};

/** 내역 한 페이지 크기. 앱과 같은 값(ChatApi.fetchMessages 기본 size). */
export const CHAT_PAGE_SIZE = 30;
