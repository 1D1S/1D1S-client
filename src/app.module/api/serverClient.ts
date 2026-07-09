import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { API_BASE_URL } from './config';
import type { ApiResponse } from './types';

/**
 * 서버 컴포넌트(RSC)에서 백엔드 API 를 호출하는 헬퍼.
 *
 * - 들어온 요청의 쿠키를 그대로 백엔드에 포워딩
 * - 실패 시 throw 해 호출부(`prefetchQuery`)가 캐시하지 않도록 한다.
 *   (TanStack `prefetchQuery` 는 내부에서 throw 를 catch 하므로 페이지 렌더는
 *   깨지지 않는다. dehydrate 설정은 error 상태를 제외하므로 클라이언트는
 *   캐시 없이 마운트 시 새로 fetch 한다.)
 */

function createServerClient(cookieHeader: string): AxiosInstance {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    maxRedirects: 0,
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

const buildCookieHeader = cache(async (): Promise<string> => {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
});

interface ServerRequestOptions extends AxiosRequestConfig {
  url: string;
}

export async function serverRequestData<TData>(
  config: ServerRequestOptions
): Promise<TData> {
  const cookieHeader = await buildCookieHeader();
  const client = createServerClient(cookieHeader);
  const response = await client.request<ApiResponse<TData>>(config);
  return response.data.data;
}
