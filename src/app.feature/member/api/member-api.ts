import { apiClient } from '@module/api/client';
import { requestData } from '@module/api/request';

import type { MyPageData, SidebarData } from '../type/member';

export const memberApi = {
  getSidebar: async (): Promise<SidebarData> =>
    requestData<SidebarData>(apiClient, {
      url: '/member/side-bar',
      method: 'GET',
    }),

  getMyPage: async (): Promise<MyPageData> =>
    requestData<MyPageData>(apiClient, {
      url: '/member/my-page',
      method: 'GET',
    }),

  updateNickname: async (nickname: string): Promise<void> =>
    requestData<void>(apiClient, {
      url: '/member/nickname',
      method: 'PATCH',
      data: { nickname },
    }),

  updateProfileImage: async (file: File): Promise<{ profileUrl: string }> => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return requestData<{ profileUrl: string }>(apiClient, {
      url: '/member/profile-image',
      method: 'PATCH',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
