import axios from 'axios';
import {
  CreateDiaryRequest,
  CreateDiaryResponse,
  UpdateDiaryRequest,
  UpdateDiaryResponse,
  DiaryDetail,
  DiaryListResponse,
  DiaryListParams,
  RandomDiaryParams,
  DiaryItem,
  CreateDiaryReportRequest,
  UploadImageResponse,
  UploadImagesResponse,
} from '../type/diary';
import { authStorage } from '@module/utils/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://api.example.com',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const diaryApi = {
  // 다이어리 생성하기
  createDiary: async (data: CreateDiaryRequest): Promise<CreateDiaryResponse> => {
    const response = await api.post('/diaries', data);
    return response.data.data;
  },

  // 다이어리 수정하기
  updateDiary: async (id: number, data: UpdateDiaryRequest): Promise<UpdateDiaryResponse> => {
    const response = await api.put(`/diaries/${id}`, data);
    return response.data.data;
  },

  // 다이어리 모두 조회 (페이지네이션)
  getDiaryList: async (params: DiaryListParams = {}): Promise<DiaryListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.size) {
      searchParams.append('size', params.size.toString());
    }
    if (params.cursor) {
      searchParams.append('cursor', params.cursor);
    }

    const response = await api.get(`/diaries?${searchParams.toString()}`);
    return response.data.data;
  },

  // 다이어리 모두 조회 (전체)
  getAllDiaries: async (): Promise<DiaryItem[]> => {
    const response = await api.get('/diaries/all');
    return response.data.data;
  },

  // 다이어리 삭제
  deleteDiary: async (id: number): Promise<void> => {
    await api.delete(`/diaries/${id}`);
  },

  // 다이어리 ID로 조회
  getDiaryById: async (id: number): Promise<DiaryDetail> => {
    const response = await api.get(`/diaries/${id}`);
    return response.data.data;
  },

  // 다이어리 좋아요 누르기
  likeDiary: async (id: number): Promise<number> => {
    const response = await api.post(`/diaries/${id}/likes`);
    return response.data.data;
  },

  // 다이어리 좋아요 취소하기
  unlikeDiary: async (id: number): Promise<number> => {
    const response = await api.delete(`/diaries/${id}/likes`);
    return response.data.data;
  },

  // 랜덤 다이어리 보여주기
  getRandomDiaries: async (params: RandomDiaryParams = {}): Promise<DiaryItem[]> => {
    const { size = 10 } = params;
    const response = await api.get(`/diaries/random?size=${size}`);
    return response.data.data;
  },

  // 다이어리 리포트 생성
  createDiaryReport: async (data: CreateDiaryReportRequest): Promise<boolean> => {
    const response = await api.post('/diaries/report', data);
    return response.data.data;
  },

  // 다이어리에 이미지 1개 추가하기
  uploadDiaryImage: async (id: number, file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/diaries/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // 다이어리 이미지 여러개 한번에 올리기
  uploadDiaryImages: async (id: number, files: File[]): Promise<UploadImagesResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/diaries/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
