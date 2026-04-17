import axios, { type AxiosInstance } from 'axios';

import { API_BASE_URL } from './config';
import { attachInterceptors, type ClientOptions } from './interceptors';

const createClient = (options: ClientOptions): AxiosInstance =>
  attachInterceptors(
    axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      maxRedirects: 0,
      withCredentials: true,
    }),
    options
  );

export const apiClient = createClient({
  handleUnauthorized: true,
});

export const publicApiClient = createClient({
  handleUnauthorized: false,
});

// auth/token, auth/logout 직접 호출용 (순환 임포트 방지 - auth-api.ts가 client.ts를 임포트함)
export const tokenClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 사이드바 등 선택적 인증 요청용: 401은 조용히 null 반환, 302는 토큰 재발급 후 재시도
// withCredentials로 쿠키를 자동 전송하고, 에러는 호출부에서 직접 처리
export const silentAuthClient: AxiosInstance = (() => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const config = error?.config as import('axios').InternalAxiosRequestConfig & {
        _retried?: boolean;
      };

      // 302: 세션 만료 → 토큰 재발급 후 재시도
      if (status === 302 && config && !config._retried) {
        config._retried = true;
        try {
          await tokenClient.get('/auth/token');
          return instance.request(config);
        } catch {
          // 재발급 실패는 호출부에서 처리
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
})();
