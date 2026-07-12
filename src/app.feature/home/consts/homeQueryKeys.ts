export const HOME_QUERY_KEYS = {
  all: ['home'] as const,
  todayChallenges: () =>
    [...HOME_QUERY_KEYS.all, 'today-challenges'] as const,
};
