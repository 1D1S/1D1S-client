export const MEMBER_QUERY_KEYS = {
  all: ['member'] as const,
  sidebar: () => [...MEMBER_QUERY_KEYS.all, 'sidebar'] as const,
  myPage: () => [...MEMBER_QUERY_KEYS.all, 'myPage'] as const,
  profiles: () => [...MEMBER_QUERY_KEYS.all, 'profile'] as const,
  profile: (memberId: number) =>
    [...MEMBER_QUERY_KEYS.profiles(), memberId] as const,
};
