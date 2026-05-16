export const STORY_QUERY_KEYS = {
  all: ['stories'] as const,
  list: () => [...STORY_QUERY_KEYS.all, 'list'] as const,
};
