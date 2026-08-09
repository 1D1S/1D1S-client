import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import type {
  VoteDetail,
  VoteSubmitRequest,
  VoteSummary,
} from '../type/vote';

export const voteApi = {
  getTodayVotes: (): Promise<VoteSummary[]> =>
    requestData<VoteSummary[]>(apiClient, {
      url: '/votes/today',
      method: 'GET',
    }),

  getVoteDetail: (voteId: number): Promise<VoteDetail> =>
    requestData<VoteDetail>(apiClient, {
      url: `/votes/${voteId}`,
      method: 'GET',
    }),

  submitVote: (
    voteId: number,
    data: VoteSubmitRequest
  ): Promise<VoteDetail> =>
    requestData<VoteDetail, VoteSubmitRequest>(apiClient, {
      url: `/votes/${voteId}/responses`,
      method: 'POST',
      data,
    }),
};
