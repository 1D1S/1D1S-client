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
