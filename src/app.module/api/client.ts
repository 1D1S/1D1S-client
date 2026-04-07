import axios, { type AxiosInstance } from 'axios';

import { API_BASE_URL } from './config';
import { attachInterceptors, type ClientOptions } from './interceptors';

const createClient = (options: ClientOptions): AxiosInstance =>
  attachInterceptors(
    axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      maxRedirects: 0,
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
