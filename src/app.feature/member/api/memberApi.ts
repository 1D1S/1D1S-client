import {
  type DiaryItemApi,
  normalizeDiaryItems,
} from '@feature/diary/shared/utils/normalizeDiary';
import { apiClient } from '@module/api/client';
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

  checkNickname: async (nickname: string): Promise<{ message?: string }> =>
    requestBody<{ message?: string }>(apiClient, {
      url: '/member/nickname/check',
      method: 'POST',
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
