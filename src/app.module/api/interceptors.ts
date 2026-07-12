import { trimTrailingSlash } from '@module/utils/url';
import {
  type AxiosInstance,
  type AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from './config';
import { isUnauthorizedError } from './error';
import { handleAuthError, notifyApiError } from './errorNotify';
import { refreshAccessTokenOnce } from './tokenRefresh';

export interface ClientOptions {
  handleUnauthorized: boolean;
}

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve(): void;
  reject(error: unknown): void;
}> = [];

const onTokenRefreshed = (): void => {
  refreshSubscribers.forEach(({ resolve }) => resolve());
  refreshSubscribers = [];
};

const onTokenRefreshFailed = (error: unknown): void => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

const addRefreshSubscriber = ({
  resolve,
  reject,
}: {
  resolve(): void;
  reject(error: unknown): void;
}): void => {
  refreshSubscribers.push({ resolve, reject });
};

// 회전형 refresh 토큰의 동시 갱신 레이스를 막기 위해 모든 갱신 경로가
// 공유하는 single-flight 를 사용한다 (tokenRefresh.ts 참고).
const refreshAccessToken = refreshAccessTokenOnce;

export const attachInterceptors = (
  client: AxiosInstance,
  { handleUnauthorized }: ClientOptions
): AxiosInstance => {
  client.interceptors.response.use(
    async (response) => {
      if (!handleUnauthorized) {
        return response;
      }

      const config = response.config as RetryableAxiosRequestConfig;

      if (config._retry) {
        return response;
      }

      // 비멱등 메서드는 재시도 시 중복 부작용(예: 댓글 2건 생성)이 발생하므로
      // responseURL 휴리스틱 기반 자동 재시도를 GET 요청에만 적용한다.
      const method = (config.method ?? 'get').toLowerCase();
      if (method !== 'get') {
        return response;
      }

      const xhr = response.request as XMLHttpRequest | undefined;
      const responseUrl = xhr?.responseURL ?? '';
      const baseUrl = trimTrailingSlash(API_BASE_URL);
      const requestPath = response.config.url ?? '';
      const expectedUrl = `${baseUrl}${requestPath}`;

      const wasRedirected =
        responseUrl !== '' &&
        !responseUrl.startsWith(expectedUrl) &&
        requestPath.length > 1 &&
        !responseUrl.includes(requestPath);

      if (!wasRedirected) {
        return response;
      }

      // 재시도 전 _retry 를 세워, refresh 후에도 리다이렉트가 지속되면(백엔드가
      // 특정 GET 을 계속 로그인으로 넘기거나 wasRedirected 오탐) 위 63행 가드로
      // 응답을 그대로 반환하고 무한 refresh 루프를 끊는다. 401 에러 경로(124행)와
      // 동일한 1회 재시도 계약을 이 성공-리다이렉트 경로에도 맞춘다.
      config._retry = true;

      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          addRefreshSubscriber({
            resolve: () => {
              resolve(client(response.config));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed();
        return client(response.config);
      } catch (refreshError) {
        isRefreshing = false;
        onTokenRefreshFailed(refreshError);
        handleAuthError(refreshError);
        return Promise.reject(refreshError);
      }
    },
    async (error) => {
      if (handleUnauthorized && isUnauthorizedError(error)) {
        const originalRequest = error.config as RetryableAxiosRequestConfig;

        if (originalRequest._retry) {
          handleAuthError(error);
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            await refreshAccessToken();
            isRefreshing = false;
            onTokenRefreshed();

            return client(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            onTokenRefreshFailed(refreshError);
            handleAuthError(refreshError);
            return Promise.reject(refreshError);
          }
        }

        return new Promise<AxiosResponse>((resolve, reject) => {
          addRefreshSubscriber({
            resolve: () => {
              originalRequest._retry = false;
              resolve(client(originalRequest));
            },
            reject,
          });
        });
      }

      if (!handleUnauthorized && !isUnauthorizedError(error)) {
        notifyApiError(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
};
