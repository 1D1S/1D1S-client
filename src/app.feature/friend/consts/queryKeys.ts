export const FRIEND_QUERY_KEYS = {
  all: ['friends'] as const,
  list: () => [...FRIEND_QUERY_KEYS.all, 'list'] as const,
  relations: () => [...FRIEND_QUERY_KEYS.all, 'relation'] as const,
  relation: (memberId: number) =>
    [...FRIEND_QUERY_KEYS.relations(), memberId] as const,
  sentRequests: () => [...FRIEND_QUERY_KEYS.all, 'requests', 'sent'] as const,
  receivedRequests: () =>
    [...FRIEND_QUERY_KEYS.all, 'requests', 'received'] as const,
  blocked: () => [...FRIEND_QUERY_KEYS.all, 'block'] as const,
};
