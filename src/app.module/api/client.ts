import { authStorage } from '@module/utils/auth';
import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

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
  withAuthToken: true,
  handleUnauthorized: true,
});

export const publicApiClient = createClient({
  withAuthToken: false,
  handleUnauthorized: false,
});

// auth/token, auth/logout 직접 호출용 (순환 임포트 방지 - auth-api.ts가 client.ts를 임포트함)
const tokenClient = axios.create({
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

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window === 'undefined') {
        return config;
      }

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        return config;
      }

      const authorizationValue = accessToken.startsWith('Bearer ')
        ? accessToken
        : `Bearer ${accessToken}`;

      const headers = AxiosHeaders.from(config.headers);
      if (!headers.has('Authorization')) {
        headers.set('Authorization', authorizationValue);
        config.headers = headers;
      }

      return config;
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const config = error?.config as InternalAxiosRequestConfig & {
        _retried?: boolean;
      };

      // 302: 세션 만료 → 토큰 재발급 후 재시도
      if (status === 302 && config && !config._retried) {
        config._retried = true;
        try {
          await tokenClient.get('/auth/token');
          return instance.request(config);
        } catch {
          // 재발급 실패 → 로그아웃 처리 후 인증 상태 초기화
          try {
            await tokenClient.post('/auth/logout');
          } catch {
            // 로그아웃 API 실패는 무시하고 로컬 상태만 정리
          }
          authStorage.clearTokens();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('1d1s:sidebar');
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
})();
