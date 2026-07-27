export const VOTE_QUERY_KEYS = {
  all: ['votes'] as const,
  today: () => [...VOTE_QUERY_KEYS.all, 'today'] as const,
  details: () => [...VOTE_QUERY_KEYS.all, 'detail'] as const,
  detail: (voteId: number) =>
    [...VOTE_QUERY_KEYS.details(), voteId] as const,
};
