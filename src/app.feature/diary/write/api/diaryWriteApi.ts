import { apiClient } from '@module/api/client';
import { UPLOAD_TIMEOUT_MS } from '@module/api/config';
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
      // 이미지 다수 포함 시 저장이 느려 기본 10초로는 부족.
      timeout: UPLOAD_TIMEOUT_MS,
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
      timeout: UPLOAD_TIMEOUT_MS,
    }),

  // 다이어리 리포트 생성
  createDiaryReport: async (data: CreateDiaryReportRequest): Promise<boolean> =>
    requestData<boolean, CreateDiaryReportRequest>(apiClient, {
      url: '/diaries/report',
      method: 'POST',
      data,
    }),
};
