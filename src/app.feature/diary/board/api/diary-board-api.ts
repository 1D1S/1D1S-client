import { apiClient } from '@module/api/client';
import { buildQueryString, requestData } from '@module/api/request';

import {
  DiaryItem,
  DiaryListParams,
  DiaryListResponse,
  RandomDiaryParams,
} from '../type/diary';

export const diaryBoardApi = {
  // 다이어리 모두 조회 (페이지네이션)
  getDiaryList: async (
    params: DiaryListParams = {}
  ): Promise<DiaryListResponse> => {
    const query = buildQueryString({
      size: params.size,
      cursor: params.cursor,
    });

    return requestData<DiaryListResponse>(apiClient, {
      url: query ? `/diaries?${query}` : '/diaries',
      method: 'GET',
    });
  },

  // 다이어리 모두 조회 (전체)
  getAllDiaries: async (): Promise<DiaryItem[]> =>
    requestData<DiaryItem[]>(apiClient, {
      url: '/diaries/all',
      method: 'GET',
    }),

  // 랜덤 다이어리 보여주기
  getRandomDiaries: async (
    params: RandomDiaryParams = {}
  ): Promise<DiaryItem[]> => {
    const { size = 10 } = params;
    const query = buildQueryString({ size });

    return requestData<DiaryItem[]>(apiClient, {
      url: `/diaries/random?${query}`,
      method: 'GET',
    });
  },
};
