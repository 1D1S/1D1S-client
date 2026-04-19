import { apiClient } from '@module/api/client';
import { requestBody, requestData } from '@module/api/request';

import type { MemberProfileData, MyPageData, SidebarData } from '../type/member';

export const memberApi = {
  getSidebar: async (): Promise<SidebarData> =>
    requestData<SidebarData>(apiClient, {
      url: '/member/side-bar',
      method: 'GET',
    }),

  getMemberProfile: async (memberId: number): Promise<MemberProfileData> =>
    requestData<MemberProfileData>(apiClient, {
      url: `/member/profile/${memberId}`,
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

  updateProfileImage: async (file: File): Promise<void> => {
    const { presignedUrl, objectKey } = await requestData<{
      presignedUrl: string;
      objectKey: string;
    }>(apiClient, {
      url: '/image/presigned-url',
      method: 'POST',
      data: { fileName: file.name, fileType: file.type },
    });

    // iOS에서 HEIC 등 일부 포맷은 file.type이 빈 문자열일 수 있음
    // Content-Type이 없으면 S3 서명 불일치(403)가 발생하므로 fallback 적용
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg' },
    });

    await requestData<void>(apiClient, {
      url: '/member/profile-image',
      method: 'PATCH',
      data: { objectKey },
    });
  },

  deleteMember: async (): Promise<{ message?: string }> =>
    requestBody<{ message?: string }>(apiClient, {
      url: '/member',
      method: 'DELETE',
    }),
};
