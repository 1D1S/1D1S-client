import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from './config';
import { handleAuthError, isUnauthorizedError, notifyApiError } from './error';

export interface ClientOptions {
  withAuthToken: boolean;
  handleUnauthorized: boolean;
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

const refreshAccessToken = async (): Promise<void> => {
  // refresh 토큰이 쿠키에 저장되므로, 별도의 헤더 전달 없이 API를 호출하면 백엔드에서 쿠키를 읽어 새 access 토큰이 든 Set-Cookie 응답을 줍니다.
  await axios.get(`${API_BASE_URL}/auth/token`, {
    withCredentials: true,
  });
};

export const attachInterceptors = (
  client: AxiosInstance,
  { withAuthToken, handleUnauthorized }: ClientOptions
): AxiosInstance => {
  if (withAuthToken) {
    client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => config
    );
  }

  client.interceptors.response.use(
    async (response) => {
      if (!handleUnauthorized) {
        return response;
      }

      // 브라우저에서 302는 XHR이 자동으로 따라가므로 에러 인터셉터에 잡히지 않음
      // responseURL이 원래 요청 URL과 다르면 리다이렉트가 발생한 것으로 판단
      const xhr = response.request as XMLHttpRequest | undefined;
      const responseUrl = xhr?.responseURL ?? '';
      const baseUrl = API_BASE_URL.replace(/\/$/, '');
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

      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          addRefreshSubscriber({
            resolve: () => {
              resolve(client(response.config));
            },
            reject: (error: unknown) => {
              reject(error);
            },
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
        const originalRequest = error.config;

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
              resolve(client(originalRequest));
            },
            reject: (error) => {
              reject(error);
            },
          });
        });
      }

      if (!handleUnauthorized) {
        notifyApiError(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
};
