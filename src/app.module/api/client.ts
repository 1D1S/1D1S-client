import { authStorage } from '@module/utils/auth';
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from './config';
import { handleAuthError, notifyApiError } from './error';

interface ClientOptions {
  withAuthToken: boolean;
  handleUnauthorized: boolean;
}

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
    (error) => {
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
