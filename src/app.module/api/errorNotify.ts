'use client';

import { toast } from '@module/providers/toast';
import { authStorage } from '@module/utils/auth';
import { NativeTokenRefreshError } from '@module/utils/nativeBridge';
import { loginUrlFromCurrentLocation } from '@module/utils/returnTo';

import { API_BASE_URL } from './config';
import {
  isAuthPrincipalError,
  isCanceledError,
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

// 로그아웃 진행 창(window). 로그아웃은 토큰을 지운 뒤 로그아웃 POST·잔여
// in-flight 요청들이 401/네트워크로 무더기로 떨어진다 — 전부 사용자가 의도한
// 정리라, 이 창 동안은 에러 토스트를 통째로 억제한다. ERR_CANCELED/
// NativeTokenRefreshError 로 안 잡히는 "네트워크 연결…"(응답 없는 실패)까지 커버.
let logoutSuppressUntil = 0;

export const beginLogoutSuppression = (durationMs = 5000): void => {
  logoutSuppressUntil = Date.now() + durationMs;
};

const isLogoutSuppressed = (): boolean => Date.now() < logoutSuppressUntil;

// 챌린지/일지 상세(/challenge/{id}, /diary/{id})는 비인증 공개 조회가
// 열려 있어(미들웨어 제외 + OG 크롤러 대응) 여기서도 보호 경로로 취급하지
// 않는다 — 넣으면 공유 링크로 들어온 게스트가 로그인으로 튕긴다.
const PROTECTED_PATH_PREFIXES = [
  '/mypage',
  '/diary/create',
  '/challenge/create',
];

const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
    // 네비게이션이 무산될 수 있는 환경(WebView 등)을 대비해 래치를 풀어준다.
    setTimeout(() => {
      isRedirecting = false;
    }, 5000);
    // 로그인 후 보던 페이지로 복귀할 수 있게 returnTo 를 실어 보낸다.
    window.location.assign(loginUrlFromCurrentLocation());
  }
};

// 객체가 아닌 에러(문자열·undefined 등)는 WeakSet 에 못 담는다. 그대로 두면
// 같은 실패가 여러 번 토스트된다 — 메시지 기준으로 짧게 중복을 막는다.
const recentMessages = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 3000;

const isDuplicateMessage = (message: string): boolean => {
  const now = Date.now();
  for (const [key, at] of recentMessages) {
    if (now - at > DUPLICATE_WINDOW_MS) {
      recentMessages.delete(key);
    }
  }
  if (recentMessages.has(message)) {
    return true;
  }
  recentMessages.set(message, now);
  return false;
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

  // 로그아웃 진행 중 — 로그아웃 POST 실패("네트워크 연결…")·잔여 요청 401 등을
  // 전부 억제한다. 사용자가 나가는 중이라 어떤 에러도 띄울 이유가 없다.
  if (isLogoutSuppressed()) {
    return;
  }

  // 취소/중단된 요청(로그아웃·페이지 전환 시 in-flight abort)은 사용자 잘못이
  // 아니므로 토스트하지 않는다. 이걸 막지 않으면 로그아웃 순간 여러 요청이
  // 동시에 abort 되며 "네트워크 오류" 토스트가 중복으로 뜬다.
  if (isCanceledError(error)) {
    return;
  }

  // 인증 계열 에러는 토스트로 노출하지 않고 조용히 처리한다. 비로그인/세션 만료는
  // 사용자에게 "잘못된 시큐리티 프린시플" 같은 원문 에러를 보여줄 게 아니라,
  // 세션 힌트를 정리하고 (보호 경로면) 로그인으로 유도해야 한다.
  //   - 401: 토큰 없음/만료
  //   - AUTH-001/AUTH-002: 익명/무효 principal 로 인증 필수 API 호출(400)
  //   - AUTH-006/AUTH-012: refresh token 무효
  // 네이티브 토큰 갱신 실패 = 세션 만료. 로그아웃 직후 살아 있던 요청들이
  // 여기로 몰리는데, 사용자에게 보여줄 성질의 오류가 아니다.
  if (error instanceof NativeTokenRefreshError) {
    return;
  }

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
  if (isDuplicateMessage(normalizedError.message)) {
    return;
  }
  toast.error(normalizedError.message);
};
