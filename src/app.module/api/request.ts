import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { ApiResponse, QueryParamValue } from './types';

type RequestConfig<TBody = unknown> = AxiosRequestConfig<TBody>;

const appendParam = (
  searchParams: URLSearchParams,
  key: string,
  value: QueryParamValue
): void => {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => searchParams.append(key, String(item)));
    return;
  }

  searchParams.append(key, String(value));
};

export const buildQueryString = (
  params: Record<string, QueryParamValue>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) =>
    appendParam(searchParams, key, value)
  );

  return searchParams.toString();
};

export const requestData = async <TData, TBody = unknown>(
  client: AxiosInstance,
  config: RequestConfig<TBody>
): Promise<TData> => {
  const response = await client.request<
    ApiResponse<TData>,
    AxiosResponse<ApiResponse<TData>>,
    TBody
  >(config);
  return response.data.data;
};

export const requestBody = async <TResponse, TBody = unknown>(
  client: AxiosInstance,
  config: RequestConfig<TBody>
): Promise<TResponse> => {
  const response = await client.request<
    TResponse,
    AxiosResponse<TResponse>,
    TBody
  >(config);
  return response.data;
};
