export const MEMBER_QUERY_KEYS = {
  sidebar: () => ['member', 'sidebar'] as const,
  myPage: () => ['member', 'myPage'] as const,
  profile: (memberId: number) => ['member', 'profile', memberId] as const,
};
