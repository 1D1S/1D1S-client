// 배너 쿼리 키 팩토리.
export const BANNER_QUERY_KEYS = {
  all: ['banners'] as const,
  list: () => [...BANNER_QUERY_KEYS.all, 'list'] as const,
};
