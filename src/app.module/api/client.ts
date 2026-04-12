import { authStorage } from '@module/utils/auth';
import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from './config';
import { handleAuthError, notifyApiError } from './error';

interface ClientOptions {
  handleUnauthorized: boolean;
}

const attachInterceptors = (
  client: AxiosInstance,
  { handleUnauthorized }: ClientOptions
): AxiosInstance => {
  client.interceptors.request.use(
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
      if (headers.has('Authorization')) {
        return config;
      }

      headers.set('Authorization', authorizationValue);
      config.headers = headers;

      return config;
    }
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (handleUnauthorized) {
        handleAuthError(error);
      } else {
        notifyApiError(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const createClient = (options: ClientOptions): AxiosInstance =>
  attachInterceptors(
    axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
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

// 사이드바 등 선택적 인증 요청용: 401 리다이렉트/토스트 없이 조용히 실패
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

  return instance;
})();
