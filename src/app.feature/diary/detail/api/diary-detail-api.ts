import { apiClient } from '@module/api/client';
import { requestBody, requestData } from '@module/api/request';

import { DiaryDetail } from '../../board/type/diary';

export const diaryDetailApi = {
  // 다이어리 ID로 조회
  getDiaryById: async (id: number): Promise<DiaryDetail> =>
    requestData<DiaryDetail>(apiClient, {
      url: `/diaries/${id}`,
      method: 'GET',
    }),

  // 다이어리 삭제
  deleteDiary: async (id: number): Promise<void> => {
    await requestBody(apiClient, {
      url: `/diaries/${id}`,
      method: 'DELETE',
    });
  },

  // 다이어리 좋아요 누르기
  likeDiary: async (id: number): Promise<number> =>
    requestData<number>(apiClient, {
      url: `/diaries/${id}/likes`,
      method: 'POST',
    }),

  // 다이어리 좋아요 취소하기
  unlikeDiary: async (id: number): Promise<number> =>
    requestData<number>(apiClient, {
      url: `/diaries/${id}/likes`,
      method: 'DELETE',
    }),
};
