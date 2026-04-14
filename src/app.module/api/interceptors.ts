import axios, {
  type AxiosInstance,
  type AxiosResponse,
} from 'axios';

import { API_BASE_URL } from './config';
import { handleAuthError, isUnauthorizedError, notifyApiError } from './error';

export interface ClientOptions {
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
  await axios.get(`${API_BASE_URL}/auth/token`, {
    withCredentials: true,
  });
};

export const attachInterceptors = (
  client: AxiosInstance,
  { handleUnauthorized }: ClientOptions
): AxiosInstance => {
  client.interceptors.response.use(
    async (response) => {
      if (!handleUnauthorized) {
        return response;
      }

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
            resolve: () => resolve(client(response.config)),
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
            resolve: () => resolve(client(originalRequest)),
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
