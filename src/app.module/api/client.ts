import axios, {
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
    (config: InternalAxiosRequestConfig) => config
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
