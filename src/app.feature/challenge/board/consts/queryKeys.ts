import {
  ChallengeListParams,
  MemberChallengesParams,
  ParticipantListParams,
  RandomChallengesParams,
} from '../type/challenge';

export const CHALLENGE_QUERY_KEYS = {
  all: ['challenges'] as const,
  lists: () => [...CHALLENGE_QUERY_KEYS.all, 'list'] as const,
  list: (params: ChallengeListParams) =>
    [...CHALLENGE_QUERY_KEYS.lists(), params] as const,
  details: () => [...CHALLENGE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CHALLENGE_QUERY_KEYS.details(), id] as const,
  randoms: () => [...CHALLENGE_QUERY_KEYS.all, 'random'] as const,
  random: (params: RandomChallengesParams) =>
    [...CHALLENGE_QUERY_KEYS.randoms(), params] as const,
  members: () => [...CHALLENGE_QUERY_KEYS.all, 'member'] as const,
  memberChallenges: (params: MemberChallengesParams) =>
    [...CHALLENGE_QUERY_KEYS.members(), params] as const,
  checkWrite: (challengeId: number) =>
    [...CHALLENGE_QUERY_KEYS.all, 'check-write', challengeId] as const,
  challengeDiaries: () => [...CHALLENGE_QUERY_KEYS.all, 'diaries'] as const,
  diaries: (
    challengeId: number,
    params?: { page?: number; size?: number; date?: string }
  ) =>
    [
      ...CHALLENGE_QUERY_KEYS.challengeDiaries(),
      challengeId,
      params,
    ] as const,
  diariesInfinite: (
    challengeId: number,
    params?: { size?: number; date?: string }
  ) =>
    [
      ...CHALLENGE_QUERY_KEYS.challengeDiaries(),
      challengeId,
      'infinite',
      params,
    ] as const,
  statistics: (challengeId: number) =>
    [...CHALLENGE_QUERY_KEYS.all, 'statistics', challengeId] as const,
  participants: () => [...CHALLENGE_QUERY_KEYS.all, 'participants'] as const,
  participantList: (challengeId: number, params?: ParticipantListParams) =>
    [...CHALLENGE_QUERY_KEYS.participants(), challengeId, params] as const,
};
