import { apiClient } from '@module/api/client';
import { requestBody, requestData } from '@module/api/request';

import {
  CreateDiaryReportRequest,
  CreateDiaryRequest,
  CreateDiaryResponse,
  UpdateDiaryRequest,
  UpdateDiaryResponse,
  UploadImageResponse,
  UploadImagesResponse,
} from '../../board/type/diary';

export const diaryWriteApi = {
  // 다이어리 생성하기
  createDiary: async (data: CreateDiaryRequest): Promise<CreateDiaryResponse> =>
    requestData<CreateDiaryResponse, CreateDiaryRequest>(apiClient, {
      url: '/diaries',
      method: 'POST',
      data,
    }),

  // 다이어리 수정하기
  updateDiary: async (
    id: number,
    data: UpdateDiaryRequest
  ): Promise<UpdateDiaryResponse> =>
    requestData<UpdateDiaryResponse, UpdateDiaryRequest>(apiClient, {
      url: `/diaries/${id}`,
      method: 'PUT',
      data,
    }),

  // 다이어리 리포트 생성
  createDiaryReport: async (data: CreateDiaryReportRequest): Promise<boolean> =>
    requestData<boolean, CreateDiaryReportRequest>(apiClient, {
      url: '/diaries/report',
      method: 'POST',
      data,
    }),

  // 다이어리에 이미지 1개 추가하기
  uploadDiaryImage: async (
    id: number,
    file: File
  ): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return requestBody<UploadImageResponse, FormData>(apiClient, {
      url: `/diaries/${id}/image`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 다이어리 이미지 여러개 한번에 올리기
  uploadDiaryImages: async (
    id: number,
    files: File[]
  ): Promise<UploadImagesResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return requestBody<UploadImagesResponse, FormData>(apiClient, {
      url: `/diaries/${id}/images`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
