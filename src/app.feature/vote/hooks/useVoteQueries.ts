import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { voteApi } from '../api/voteApi';
import { VOTE_QUERY_KEYS } from '../consts/queryKeys';
import type { VoteDetail, VoteSummary } from '../type/vote';

export function useTodayVotes(
  enabled: boolean
): UseQueryResult<VoteSummary[], Error> {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.today(),
    queryFn: async () => {
      try {
        return await voteApi.getTodayVotes();
      } catch {
        return [] as VoteSummary[];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVoteDetail(
  voteId: number | null,
  enabled: boolean
): UseQueryResult<VoteDetail, Error> {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.detail(voteId ?? 0),
    queryFn: () => voteApi.getVoteDetail(voteId ?? 0),
    enabled: enabled && voteId !== null,
  });
}
