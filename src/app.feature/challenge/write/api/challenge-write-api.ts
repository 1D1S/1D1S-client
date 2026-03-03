import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import {
  CreateChallengeRequest,
  CreateChallengeResponse,
} from '../../board/type/challenge';

export const challengeWriteApi = {
  // 챌린지 생성하기
  createChallenge: async (
    data: CreateChallengeRequest
  ): Promise<CreateChallengeResponse> =>
    requestData<CreateChallengeResponse, CreateChallengeRequest>(apiClient, {
      url: '/challenges',
      method: 'POST',
      data,
    }),
};
