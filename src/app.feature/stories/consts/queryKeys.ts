export const STORY_QUERY_KEYS = {
  all: ['stories'] as const,
  list: () => [...STORY_QUERY_KEYS.all, 'list'] as const,
};

export const STORY_DURATION_MS = 10000;
