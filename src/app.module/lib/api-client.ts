import axios, { InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '@module/utils/auth';
import { handleAuthError } from './handle-auth-error';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://api.example.com',
  timeout: 10000,
});

// Request 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터: 401 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    handleAuthError(error);
    return Promise.reject(error);
  }
);
