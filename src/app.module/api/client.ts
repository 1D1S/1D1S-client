import { authStorage } from '@module/utils/auth';
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from './config';
import { handleAuthError, isUnauthorizedError, notifyApiError } from './error';

interface ClientOptions {
  withAuthToken: boolean;
  handleUnauthorized: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.get<{
    message: string;
    data: { accessToken: string; refreshToken: string };
  }>(`${API_BASE_URL}/auth/token`, {
    headers: { 'Authorization-Refresh': `Bearer ${refreshToken}` },
  });

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  authStorage.setAccessToken(accessToken);
  authStorage.setRefreshToken(newRefreshToken);

  return accessToken;
};

const attachInterceptors = (
  client: AxiosInstance,
  { withAuthToken, handleUnauthorized }: ClientOptions
): AxiosInstance => {
  if (withAuthToken) {
    client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = authStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  client.interceptors.response.use(
    (response) => response,
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
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            onTokenRefreshed(newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          } catch {
            isRefreshing = false;
            refreshSubscribers = [];
            handleAuthError(error);
            return Promise.reject(error);
          }
        }

        return new Promise<AxiosResponse>((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
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

const createClient = (options: ClientOptions): AxiosInstance =>
  attachInterceptors(
    axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
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
