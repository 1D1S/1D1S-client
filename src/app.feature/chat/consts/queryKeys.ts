export const CHAT_QUERY_KEYS = {
  all: ['chat'] as const,
  // 목록은 archived 필터별로 따로 캐시한다. 읽음·알림 토글 뒤 무효화는
  // rooms() 프리픽스로 걸어 세 갈래를 한 번에 턴다.
  rooms: () => [...CHAT_QUERY_KEYS.all, 'rooms'] as const,
  roomList: (archived?: boolean) =>
    [...CHAT_QUERY_KEYS.rooms(), archived ?? 'all'] as const,
  messages: (roomId: number) =>
    [...CHAT_QUERY_KEYS.all, 'messages', roomId] as const,
};

/** 내역 한 페이지 크기. 앱과 같은 값(ChatApi.fetchMessages 기본 size). */
export const CHAT_PAGE_SIZE = 30;
