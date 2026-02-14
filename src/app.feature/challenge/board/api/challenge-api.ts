import axios from 'axios';
import {
  CreateChallengeRequest,
  CreateChallengeResponse,
  ChallengeDetailResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
  ChallengeListResponse,
  ChallengeListParams,
  RandomChallengesParams,
  ChallengeListItem,
  MemberChallengesParams,
} from '../type/challenge';
import { authStorage } from '@module/utils/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://api.example.com',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const challengeApi = {
  // 챌린지 생성하기
  createChallenge: async (data: CreateChallengeRequest): Promise<CreateChallengeResponse> => {
    const response = await api.post('/challenges', data);
    return response.data.data;
  },

  // 챌린지 상세 조회
  getChallengeDetail: async (challengeId: number): Promise<ChallengeDetailResponse> => {
    const response = await api.get(`/challenges/${challengeId}`);
    return response.data.data;
  },

  // 챌린지 신청하기
  joinChallenge: async (
    challengeId: number,
    data: JoinChallengeRequest
  ): Promise<JoinChallengeResponse> => {
    const response = await api.post(`/challenges/${challengeId}/participants`, data);
    return response.data.data;
  },

  // 챌린지 참여자 수락하기
  acceptParticipant: async (participantId: number): Promise<void> => {
    await api.patch(`/challenges/participants/${participantId}/accept`);
  },

  // 챌린지 참여자 거절하기
  rejectParticipant: async (participantId: number): Promise<void> => {
    await api.patch(`/challenges/participants/${participantId}/reject`);
  },

  // 챌린지 랜덤 불러오기
  getRandomChallenges: async (
    params: RandomChallengesParams = {}
  ): Promise<ChallengeListItem[]> => {
    const { size = 10 } = params;
    const response = await api.get(`/challenges/random?size=${size}`);
    return response.data.data;
  },

  // 챌린지 탈퇴하기
  leaveChallenge: async (challengeId: number): Promise<void> => {
    await api.delete(`/challenges/${challengeId}/participants`);
  },

  // 챌린지 리스트 불러오기
  getChallengeList: async (params: ChallengeListParams = {}): Promise<ChallengeListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.cursor) {
      searchParams.append('cursor', params.cursor);
    }
    if (params.keyword) {
      searchParams.append('keyword', params.keyword);
    }

    const response = await api.get(`/challenges?${searchParams.toString()}`);
    return response.data.data;
  },

  // 챌린지 좋아요 누르기
  likeChallenge: async (challengeId: number): Promise<void> => {
    await api.post(`/challenges/${challengeId}/likes`);
  },

  // 챌린지 좋아요 취소하기
  unlikeChallenge: async (challengeId: number): Promise<void> => {
    await api.delete(`/challenges/${challengeId}/likes`);
  },

  // 특정 멤버가 진행중인 챌린지 보기
  getMemberChallenges: async (params: MemberChallengesParams): Promise<ChallengeListItem[]> => {
    const response = await api.get(`/challenges/member?memberId=${params.memberId}`);
    return response.data.data;
  },
};
