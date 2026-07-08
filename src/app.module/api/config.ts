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

// presigned 발급 등 짧은 JSON 요청용 기본 타임아웃.
export const DEFAULT_TIMEOUT_MS = 10_000;

// 파일 PUT 업로드·일지 저장 등 느린 요청용 타임아웃. 이미지 여러 장을
// 스토리지에 올리는 동안 기본 10초로는 부족해 넉넉히 잡는다.
export const UPLOAD_TIMEOUT_MS = 120_000;
