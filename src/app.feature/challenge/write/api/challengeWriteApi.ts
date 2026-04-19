import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import {
  CreateChallengeRequest,
  CreateChallengeResponse,
  UpdateChallengeRequest,
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

  // 챌린지 수정하기 (변경할 필드만 전송)
  updateChallenge: async (
    challengeId: number,
    data: UpdateChallengeRequest
  ): Promise<void> =>
    requestData<void, UpdateChallengeRequest>(apiClient, {
      url: `/challenges/${challengeId}`,
      method: 'PATCH',
      data,
    }),
};
