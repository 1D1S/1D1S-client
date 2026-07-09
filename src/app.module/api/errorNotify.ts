'use client';

import { toast } from '@module/providers/toast';
import { authStorage } from '@module/utils/auth';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';

import { API_BASE_URL } from './config';
import {
  hasHttpResponseStatus,
  isInvalidRefreshTokenError,
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

const PROTECTED_PATH_PREFIXES = [
  '/mypage',
  '/diary/create',
  '/challenge/create',
];
const PROTECTED_PATH_PATTERNS = [/^\/challenge\/\d+/, /^\/diary\/\d+/];

const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
  PROTECTED_PATH_PATTERNS.some((pattern) => pattern.test(pathname));

// 무효 세션의 서버 쿠키 정리: 백엔드 /auth/logout 을 best-effort 로 호출해
// HttpOnly 쿠키를 Set-Cookie 로 만료시킨다. 인터셉터/재귀를 피하려 raw fetch 를
// 쓰고, keepalive 로 리다이렉트 중에도 요청이 살아남게 한다. (로컬 토큰은
// 호출부에서 이미 정리됨; 실제 쿠키 만료는 백엔드 Set-Cookie 가 결정)
const clearServerSession = (): void => {
  void fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    keepalive: true,
  }).catch(() => {
    // best-effort: 실패해도 로컬은 이미 정리되어 재시도 루프는 끊긴다.
  });
};

export const handleAuthError = (error: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // 401(토큰 없음/만료), refresh token 무효(AUTH-006), 그 외 서버가 응답으로
  // 거부한 모든 인증/리프레시 실패(403·회전형 refresh 재사용 감지로 family
  // 무효화 등)를 세션 복구 불가로 보고 동일하게 정리한다. 특정 상태/코드만
  // 정리하면, 서버가 다른 에러로 리프레시를 거부할 때 hasTokens() 가 계속 true 라
  // 무효 토큰이 남아 재로그인이 막히고 같은 에러가 무한 반복된다.
  // 네트워크/타임아웃(응답 없음)은 일시적일 수 있어 세션을 유지하고 다음 요청에서
  // 재시도하게 둔다.
  const invalidRefresh = isInvalidRefreshTokenError(error);
  const serverRejected = hasHttpResponseStatus(error);
  if (!isUnauthorizedError(error) && !invalidRefresh && !serverRejected) {
    return;
  }

  // 조용히 로그아웃 처리 (토스트 표시하지 않음)
  authStorage.clearTokens();
  localStorage.removeItem('1d1s:sidebar');

  // refresh token 자체가 무효면 서버 세션/HttpOnly 쿠키까지 정리한다.
  if (invalidRefresh) {
    clearServerSession();
  }

  if (!isRedirecting && isProtectedRoute(window.location.pathname)) {
    isRedirecting = true;
    // 로그인 후 보던 페이지로 복귀할 수 있게 returnTo 를 실어 보낸다.
    window.location.assign(loginUrlFromCurrentLocation());
  }
};

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

  // refresh token 자체가 무효(AUTH-006)면, 같은 에러를 토스트로 반복 노출하는
  // 대신 조용히 로그아웃 정리한다. (handleUnauthorized=false 인 publicApiClient
  // 의 /auth/token 호출이 이 경로로 들어온다.)
  if (isInvalidRefreshTokenError(error)) {
    handleAuthError(error);
    return;
  }

  if (shouldSkipToast(error)) {
    return;
  }

  const normalizedError = normalizeApiError(error);
  toast.error(normalizedError.message);
};
