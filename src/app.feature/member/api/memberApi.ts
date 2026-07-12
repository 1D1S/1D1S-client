import {
  type DiaryItemApi,
  normalizeDiaryItems,
} from '@feature/diary/shared/utils/normalizeDiary';
import { apiClient, publicApiClient } from '@module/api/client';
import { putToStorage } from '@module/api/presignedUpload';
import {
  buildQueryString,
  requestBody,
  requestData,
} from '@module/api/request';

import type {
  MemberDiaryPageInfo,
  MemberProfileData,
  MyPageData,
  SidebarData,
} from '../type/member';

type MemberProfileApiResponse = Omit<MemberProfileData, 'diaryList'> & {
  diaryList: {
    items: DiaryItemApi[];
    pageInfo: MemberDiaryPageInfo;
  };
};

export const memberApi = {
  getSidebar: async (): Promise<SidebarData> =>
    requestData<SidebarData>(apiClient, {
      url: '/member/side-bar',
      method: 'GET',
    }),

  getMemberProfile: async (
    memberId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<MemberProfileData> => {
    const query = buildQueryString({
      page: params.page,
      size: params.size,
    });
    const response = await requestData<MemberProfileApiResponse>(apiClient, {
      url: query
        ? `/member/profile/${memberId}?${query}`
        : `/member/profile/${memberId}`,
      method: 'GET',
    });
    return {
      ...response,
      diaryList: {
        items: normalizeDiaryItems(response.diaryList?.items ?? []),
        pageInfo: response.diaryList?.pageInfo ?? {
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          hasNextPage: false,
        },
      },
    };
  },

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

  updatePhoneNumber: async (phoneNumber: string): Promise<void> =>
    requestData<void>(apiClient, {
      url: '/member/phone-number',
      method: 'PATCH',
      data: { phoneNumber },
    }),

  checkNickname: async (nickname: string): Promise<{ message?: string }> =>
    requestBody<{ message?: string }>(publicApiClient, {
      url: '/member/nickname/check',
      method: 'GET',
      params: { nickname },
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

    await putToStorage(presignedUrl, file);

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
