'use client';

import { authStorage } from '@module/utils/auth';
import { toast } from 'sonner';

import {
  isRedirectError,
  isUnauthorizedError,
  normalizeApiError,
} from './error';

/**
 * 토스트/스토리지/리다이렉트 사이드이펙트를 가진 에러 헬퍼.
 *
 * `'use client'` 가 붙어 있어 RSC 에서 직접 import 하면 빌드가 실패한다.
 * 서버에서 호출되는 경로(getQueryClient 등)는 dynamic import 로 우회한다.
 */

const TOASTED_ERRORS = new WeakSet<object>();
let isRedirecting = false;

const shouldSkipToast = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (isRedirectError(error)) {
    return true;
  }

  if (TOASTED_ERRORS.has(error)) {
    return true;
  }

  TOASTED_ERRORS.add(error);
  return false;
};

export const notifyApiError = (error: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (shouldSkipToast(error)) {
    return;
  }

  const normalizedError = normalizeApiError(error);
  toast.error(normalizedError.message);
};

const PROTECTED_PATH_PREFIXES = [
  '/mypage',
  '/diary/create',
  '/challenge/create',
];
const PROTECTED_PATH_PATTERNS = [/^\/challenge\/\d+/, /^\/diary\/\d+/];

const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
  PROTECTED_PATH_PATTERNS.some((pattern) => pattern.test(pathname));

export const handleAuthError = (error: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isUnauthorizedError(error)) {
    return;
  }

  // 토큰 없음/만료 시 조용히 로그아웃 처리 (토스트 표시하지 않음)
  authStorage.clearTokens();
  localStorage.removeItem('1d1s:sidebar');

  if (!isRedirecting && isProtectedRoute(window.location.pathname)) {
    isRedirecting = true;
    window.location.assign('/');
  }
};
