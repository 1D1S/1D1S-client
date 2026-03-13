import { apiClient } from '@module/api/client';
import {
  buildQueryString,
  requestBody,
  requestData,
} from '@module/api/request';

import {
  ChallengeListItem,
  ChallengeListParams,
  ChallengeListResponse,
  MemberChallengesParams,
  RandomChallengesParams,
} from '../type/challenge';

type MemberChallengesApiResponse =
  | ChallengeListItem[]
  | {
      message?: string;
      data?: ChallengeListItem[];
    };

const normalizeMemberChallengesResponse = (
  response: MemberChallengesApiResponse
): ChallengeListItem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
};

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
  ): Promise<{ data: ChallengeListResponse; message: string }> => {
    const query = buildQueryString({
      limit: params.limit,
      cursor: params.cursor,
      keyword: params.keyword,
      category: params.category,
    });

    return requestBody<{ data: ChallengeListResponse; message: string }>(
      apiClient,
      {
        url: query ? `/challenges?${query}` : '/challenges',
        method: 'GET',
      }
    );
  },

  // 특정 멤버가 진행중인 챌린지 보기
  getMemberChallenges: async (
    params: MemberChallengesParams
  ): Promise<ChallengeListItem[]> => {
    const query = buildQueryString({ memberId: params.memberId });

    const response = await requestBody<MemberChallengesApiResponse>(apiClient, {
      url: `/challenges/member?${query}`,
      method: 'GET',
    });

    return normalizeMemberChallengesResponse(response);
  },

  // 특정 챌린지의 3일 이내 일지 작성 날짜 목록 조회
  getChallengeCheckWriteDates: async (
    challengeId: number
  ): Promise<string[]> => {
    const response = await requestBody<{
      message?: string;
      data?: unknown;
    }>(apiClient, {
      url: `/challenges/${challengeId}/check-write`,
      method: 'GET',
    });

    const isDateString = (value: string): boolean =>
      /^\d{4}-\d{2}-\d{2}$/.test(value);

    const extractDateStrings = (value: unknown): string[] => {
      if (typeof value === 'string') {
        return isDateString(value) ? [value] : [];
      }

      if (Array.isArray(value)) {
        return value.flatMap((item) => extractDateStrings(item));
      }

      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if ('diaryCreatedDate' in record) {
          return extractDateStrings(record.diaryCreatedDate);
        }
        if ('challengedDate' in record) {
          return extractDateStrings(record.challengedDate);
        }
        if ('achievedDate' in record) {
          return extractDateStrings(record.achievedDate);
        }

        return Object.entries(record).flatMap(([key, nestedValue]) => {
          const matchedKeys = isDateString(key) ? [key] : [];
          return [...matchedKeys, ...extractDateStrings(nestedValue)];
        });
      }

      return [];
    };

    return Array.from(new Set(extractDateStrings(response.data)));
  },
};
