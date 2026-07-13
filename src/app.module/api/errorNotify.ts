'use client';

import { toast } from '@module/providers/toast';
import { authStorage } from '@module/utils/auth';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';

import { API_BASE_URL } from './config';
import {
  isAuthPrincipalError,
  isForbiddenError,
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

  // 서버가 세션을 명시적으로 거부한 경우만 정리한다:
  //   - 401(토큰 없음/만료)
  //   - 403(회전형 refresh 재사용 감지로 family 무효화 등)
  //   - refresh token 무효 코드(AUTH-006)
  // 401/AUTH-006 만 정리하면, 서버가 403 등 다른 에러로 리프레시를 거부할 때
  // hasTokens() 가 계속 true 라 무효 토큰이 남아 재로그인이 막히고 같은 에러가
  // 무한 반복된다. 반대로 5xx·429·408·네트워크/타임아웃(일시적)에는 세션을
  // 유지하고 다음 요청에서 재시도하게 둔다 — 백엔드 순단으로 로그인 사용자를
  // 일괄 로그아웃시키지 않기 위함.
  // AUTH-001/AUTH-002: 세션 힌트(hasTokens)가 stale 해서 로그아웃 사용자가
  // 인증 쿼리를 실행한 경우. 서버가 400 으로 내려 401 경로를 안 타므로 여기서
  // 힌트를 정리하지 않으면 hasTokens() 가 계속 true 라 같은 요청이 반복된다.
  const invalidRefresh = isInvalidRefreshTokenError(error);
  const invalidPrincipal = isAuthPrincipalError(error);
  if (
    !isUnauthorizedError(error) &&
    !isForbiddenError(error) &&
    !invalidRefresh &&
    !invalidPrincipal
  ) {
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

  // 인증 계열 에러는 토스트로 노출하지 않고 조용히 처리한다. 비로그인/세션 만료는
  // 사용자에게 "잘못된 시큐리티 프린시플" 같은 원문 에러를 보여줄 게 아니라,
  // 세션 힌트를 정리하고 (보호 경로면) 로그인으로 유도해야 한다.
  //   - 401: 토큰 없음/만료
  //   - AUTH-001/AUTH-002: 익명/무효 principal 로 인증 필수 API 호출(400)
  //   - AUTH-006/AUTH-012: refresh token 무효
  if (
    isUnauthorizedError(error) ||
    isAuthPrincipalError(error) ||
    isInvalidRefreshTokenError(error)
  ) {
    handleAuthError(error);
    return;
  }

  if (shouldSkipToast(error)) {
    return;
  }

  const normalizedError = normalizeApiError(error);
  toast.error(normalizedError.message);
};
