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
  ParticipantListParams,
  ParticipantListResponse,
  PokeChallengeRequest,
  PokeChallengeResponse,
  VerifyChallengePasswordRequest,
  VerifyChallengePasswordResponse,
} from '../../board/type/challenge';
import { ChallengeDiaryListResponse } from '../type/challengeDiary';
import { ChallengeStatistics } from '../type/challengeStatistics';

export const challengeDetailApi = {
  // 챌린지 상세 조회
  getChallengeDetail: async (
    challengeId: number
  ): Promise<ChallengeDetailResponse> =>
    requestData<ChallengeDetailResponse>(apiClient, {
      url: `/challenges/${challengeId}`,
      method: 'GET',
    }),

  // 챌린지 참여자 목록 조회 (오프셋 페이지네이션 + 정렬 + 상태 필터)
  getParticipants: async (
    challengeId: number,
    params: ParticipantListParams = {}
  ): Promise<ParticipantListResponse> => {
    // buildQueryString 이 undefined 를 생략하고 배열(status)을 같은 키
    // 반복(status=HOST&status=PARTICIPANT)으로 직렬화한다.
    const query = buildQueryString({
      sort: params.sort,
      page: params.page,
      size: params.size,
      status: params.status,
    });

    return requestData<ParticipantListResponse>(apiClient, {
      url: query
        ? `/challenges/${challengeId}/participants?${query}`
        : `/challenges/${challengeId}/participants`,
      method: 'GET',
    });
  },

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

  // 비공개 챌린지 비밀번호 검증 후 즉시 참여
  verifyChallengePassword: async (
    challengeId: number,
    data: VerifyChallengePasswordRequest
  ): Promise<VerifyChallengePasswordResponse> =>
    requestData<
      VerifyChallengePasswordResponse,
      VerifyChallengePasswordRequest
    >(apiClient, {
      url: `/challenges/${challengeId}/verify-password`,
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

  // 챌린지원 찌르기 (오늘 일지 미작성 챌린지원에게 알림 전송)
  pokeChallengeMembers: async (
    challengeId: number,
    data: PokeChallengeRequest
  ): Promise<PokeChallengeResponse> =>
    requestData<PokeChallengeResponse, PokeChallengeRequest>(apiClient, {
      url: `/challenges/${challengeId}/pokes`,
      method: 'POST',
      data,
    }),

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

  // 참여자 목표 수정 (자유 목표 챌린지 전용, 시작 전에만 가능)
  updateParticipantGoal: async (
    challengeId: number,
    goals: string[]
  ): Promise<void> => {
    await requestBody<void, string[]>(apiClient, {
      url: `/challenges/${challengeId}/challenge-goal`,
      method: 'PATCH',
      data: goals,
    });
  },

  // 챌린지 일지 목록 조회 (date 지정 시 그 날짜 completedDate 일지만)
  getChallengeDiaries: async (
    challengeId: number,
    params: { page?: number; size?: number; date?: string } = {}
  ): Promise<ChallengeDiaryListResponse> => {
    const requestParams: Record<string, number | string> = {};
    if (params.page !== undefined) {
      requestParams.page = params.page;
    }
    if (params.size !== undefined) {
      requestParams.size = params.size;
    }
    if (params.date) {
      requestParams.date = params.date;
    }

    return requestData<ChallengeDiaryListResponse>(apiClient, {
      url: `/diaries/challenges/${challengeId}`,
      method: 'GET',
      params: Object.keys(requestParams).length > 0 ? requestParams : undefined,
    });
  },

  // 챌린지 통계 조회 (참여율/완료 목표수/일자별 일지 추이)
  getChallengeStatistics: async (
    challengeId: number
  ): Promise<ChallengeStatistics> =>
    requestData<ChallengeStatistics>(apiClient, {
      url: `/challenges/${challengeId}/statistics`,
      method: 'GET',
    }),
};
