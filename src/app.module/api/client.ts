import axios, { type AxiosInstance } from 'axios';

import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './config';
import { attachInterceptors, type ClientOptions } from './interceptors';
import { refreshAccessTokenOnce } from './tokenRefresh';

const createClient = (options: ClientOptions): AxiosInstance =>
  attachInterceptors(
    axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT_MS,
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
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: true,
});

// 사이드바 등 선택적 인증 요청용: 401/302 모두 토큰 재발급 후 1회 재시도,
// 재발급 실패 또는 재시도 후에도 인증 실패 시 호출부에서 직접 로그아웃 처리
export const silentAuthClient: AxiosInstance = (() => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT_MS,
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const config =
        error?.config as import('axios').InternalAxiosRequestConfig & {
          _retried?: boolean;
        };

      // 401(access 만료) / 302(세션 만료 redirect) → 토큰 재발급 후 재시도
      if ((status === 401 || status === 302) && config && !config._retried) {
        config._retried = true;
        try {
          // 동시 갱신 레이스 방지 — 전역 single-flight 공유
          await refreshAccessTokenOnce();
          return instance.request(config);
        } catch {
          // 재발급 실패는 호출부(forceLogout)에서 처리
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
})();
