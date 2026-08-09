import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { voteApi } from '../api/voteApi';
import { VOTE_QUERY_KEYS } from '../consts/queryKeys';
import type {
  VoteDetail,
  VoteSubmitRequest,
  VoteSummary,
} from '../type/vote';

interface SubmitVoteVariables {
  voteId: number;
  data: VoteSubmitRequest;
}

export function useSubmitVote(): UseMutationResult<
  VoteDetail,
  Error,
  SubmitVoteVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voteId, data }) => voteApi.submitVote(voteId, data),
    onSuccess: (detail, { voteId }) => {
      queryClient.setQueryData(VOTE_QUERY_KEYS.detail(voteId), detail);
      queryClient.setQueryData<VoteSummary[]>(
        VOTE_QUERY_KEYS.today(),
        (votes) =>
          votes?.map((vote) =>
            vote.id === voteId ? { ...vote, voted: true } : vote
          )
      );
    },
  });
}
