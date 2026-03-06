import { DiaryListResponse } from '@feature/diary/board/type/diary';
import { apiClient } from '@module/api/client';
import {
  buildQueryString,
  requestBody,
  requestData,
} from '@module/api/request';

import {
  ChallengeDetailResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
} from '../../board/type/challenge';

export const challengeDetailApi = {
  // 챌린지 상세 조회
  getChallengeDetail: async (
    challengeId: number
  ): Promise<ChallengeDetailResponse> =>
    requestData<ChallengeDetailResponse>(apiClient, {
      url: `/challenges/${challengeId}`,
      method: 'GET',
    }),

  // 챌린지 신청하기
  joinChallenge: async (
    challengeId: number,
    data: JoinChallengeRequest
  ): Promise<JoinChallengeResponse> =>
    requestData<JoinChallengeResponse, JoinChallengeRequest>(apiClient, {
      url: `/challenges/${challengeId}/participants`,
      method: 'POST',
      data,
    }),

  // 챌린지 참여자 수락하기
  acceptParticipant: async (participantId: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/challenges/participants/${participantId}/accept`,
      method: 'PATCH',
    });
  },

  // 챌린지 참여자 거절하기
  rejectParticipant: async (participantId: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/challenges/participants/${participantId}/reject`,
      method: 'PATCH',
    });
  },

  // 챌린지 탈퇴하기
  leaveChallenge: async (challengeId: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/challenges/${challengeId}/participants`,
      method: 'DELETE',
    });
  },

  // 챌린지 좋아요 누르기
  likeChallenge: async (challengeId: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/challenges/${challengeId}/likes`,
      method: 'POST',
    });
  },

  // 챌린지 좋아요 취소하기
  unlikeChallenge: async (challengeId: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/challenges/${challengeId}/likes`,
      method: 'DELETE',
    });
  },

  // 챌린지 일지 목록 조회 (커서 기반 페이지네이션)
  getChallengeDiaries: async (
    challengeId: number,
    params: { size?: number; cursor?: string } = {}
  ): Promise<DiaryListResponse> => {
    const query = buildQueryString({
      size: params.size,
      cursor: params.cursor,
    });

    return requestData<DiaryListResponse>(apiClient, {
      url: query
        ? `/challenges/${challengeId}/diaries?${query}`
        : `/challenges/${challengeId}/diaries`,
      method: 'GET',
    });
  },
};
