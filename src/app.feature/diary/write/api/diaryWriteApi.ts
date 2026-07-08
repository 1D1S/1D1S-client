import { apiClient } from '@module/api/client';
import { API_UPLOAD_TIMEOUT_MS } from '@module/api/config';
import { requestData } from '@module/api/request';

import {
  CreateDiaryReportRequest,
  CreateDiaryRequest,
  CreateDiaryResponse,
  UpdateDiaryRequest,
  UpdateDiaryResponse,
} from '../../board/type/diary';

export const diaryWriteApi = {
  // 다이어리 생성하기
  createDiary: async (data: CreateDiaryRequest): Promise<CreateDiaryResponse> =>
    requestData<CreateDiaryResponse, CreateDiaryRequest>(apiClient, {
      url: '/diaries',
      method: 'POST',
      data,
      timeout: API_UPLOAD_TIMEOUT_MS,
    }),

  // 다이어리 수정하기
  updateDiary: async (
    id: number,
    data: UpdateDiaryRequest
  ): Promise<UpdateDiaryResponse> =>
    requestData<UpdateDiaryResponse, UpdateDiaryRequest>(apiClient, {
      url: `/diaries/${id}`,
      method: 'PATCH',
      data,
      timeout: API_UPLOAD_TIMEOUT_MS,
    }),

  // 다이어리 리포트 생성
  createDiaryReport: async (data: CreateDiaryReportRequest): Promise<boolean> =>
    requestData<boolean, CreateDiaryReportRequest>(apiClient, {
      url: '/diaries/report',
      method: 'POST',
      data,
    }),
};
