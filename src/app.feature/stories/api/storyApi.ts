import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import { StoriesResponse } from '../type/story';

export const storyApi = {
  // 스토리 목록 조회
  getStories: async (): Promise<StoriesResponse> => {
    const response = await requestData<StoriesResponse>(apiClient, {
      url: '/stories',
      method: 'GET',
    });
    return response;
  },

  // 스토리 시청 처리
  viewStory: async (diaryId: number): Promise<void> => {
    await apiClient.request({
      url: `/stories/view/${diaryId}`,
      method: 'POST',
    });
  },
};
