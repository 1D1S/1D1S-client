import { trimTrailingSlash } from '@module/utils/url';

const normalizeBaseUrl = (url: string): string => trimTrailingSlash(url);

const resolveApiBaseUrl = (): string => {
  const envBaseUrl = process.env.NEXT_PUBLIC_ODOS_API_URL;

  if (!envBaseUrl) {
    if (typeof window !== 'undefined') {
      throw new Error('Missing API URL env. Set NEXT_PUBLIC_ODOS_API_URL.');
    }
    return '';
  }

  return normalizeBaseUrl(envBaseUrl);
};

export const API_BASE_URL = resolveApiBaseUrl();

// 일반 REST 요청(JSON) axios 기본 타임아웃.
export const API_DEFAULT_TIMEOUT_MS = 10000;

// 이미지 파일 PUT 업로드·일지 저장처럼 느려질 수 있는 요청용 타임아웃.
// 큰 파일이 느린 네트워크에서 끊기지 않도록 넉넉히 잡는다.
export const API_UPLOAD_TIMEOUT_MS = 120000;
