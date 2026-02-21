import {
  ChallengeListParams,
  MemberChallengesParams,
  RandomChallengesParams,
} from '../type/challenge';

export const CHALLENGE_QUERY_KEYS = {
  all: ['challenges'] as const,
  lists: () => [...CHALLENGE_QUERY_KEYS.all, 'list'] as const,
  list: (params: ChallengeListParams) =>
    [...CHALLENGE_QUERY_KEYS.lists(), params] as const,
  details: () => [...CHALLENGE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CHALLENGE_QUERY_KEYS.details(), id] as const,
  random: (params: RandomChallengesParams) =>
    [...CHALLENGE_QUERY_KEYS.all, 'random', params] as const,
  memberChallenges: (params: MemberChallengesParams) =>
    [...CHALLENGE_QUERY_KEYS.all, 'member', params] as const,
};
