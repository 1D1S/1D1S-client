import { apiClient } from '@module/api/client';
import { buildQueryString, requestData } from '@module/api/request';

import {
  ChallengeListItem,
  ChallengeListParams,
  ChallengeListResponse,
  MemberChallengesParams,
  RandomChallengesParams,
} from '../type/challenge';

export const challengeBoardApi = {
  // 챌린지 랜덤 불러오기
  getRandomChallenges: async (
    params: RandomChallengesParams = {}
  ): Promise<ChallengeListItem[]> => {
    const { size = 10 } = params;
    const query = buildQueryString({ size });

    return requestData<ChallengeListItem[]>(apiClient, {
      url: `/challenges/random?${query}`,
      method: 'GET',
    });
  },

  // 챌린지 리스트 불러오기
  getChallengeList: async (
    params: ChallengeListParams = {}
  ): Promise<ChallengeListResponse> => {
    const query = buildQueryString({
      limit: params.limit,
      cursor: params.cursor,
      keyword: params.keyword,
    });

    return requestData<ChallengeListResponse>(apiClient, {
      url: query ? `/challenges?${query}` : '/challenges',
      method: 'GET',
    });
  },

  // 특정 멤버가 진행중인 챌린지 보기
  getMemberChallenges: async (
    params: MemberChallengesParams
  ): Promise<ChallengeListItem[]> => {
    const query = buildQueryString({ memberId: params.memberId });

    return requestData<ChallengeListItem[]>(apiClient, {
      url: `/challenges/member?${query}`,
      method: 'GET',
    });
  },
};
