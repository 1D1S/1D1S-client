import type { ApiErrorResponse, NormalizedApiError } from './types';

/**
 * 서버 컴포넌트(RSC)와 클라이언트 양쪽에서 import 가능한 순수 에러 헬퍼.
 *
 * Turbopack RSC 스캐너는 `axios` 패키지를 client-only 로 취급해
 * import 만 해도 모듈을 client component 로 강제한다. 그래서 axios.isAxiosError
 * 대신 객체 marker (`isAxiosError === true`) 를 직접 검사한다 — 의미상 동일.
 *
 * 토스트/스토리지 같은 사이드이펙트는 `errorNotify.ts` 로 분리되어 있다.
 */

const DEFAULT_ERROR_MESSAGE =
  '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
const TIMEOUT_ERROR_MESSAGE =
  '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
const UNAUTHORIZED_ERROR_MESSAGE = '로그인이 필요하거나 세션이 만료되었습니다.';

const STATUS_ERROR_MESSAGE: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: UNAUTHORIZED_ERROR_MESSAGE,
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  408: TIMEOUT_ERROR_MESSAGE,
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  502: '서버와 연결할 수 없습니다.',
  503: '서비스가 일시적으로 불가능합니다.',
  504: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
};

interface AxiosErrorLike {
  isAxiosError: true;
  code?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

const isAxiosErrorLike = (error: unknown): error is AxiosErrorLike => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  return (error as { isAxiosError?: unknown }).isAxiosError === true;
};

// 백엔드가 상태 텍스트를 그대로 message 로 내려주는 경우(예: 500 →
// "Internal Server Error")는 사용자에게 의미가 없으므로 무시하고 상태 코드
// 기반 한글 메시지로 대체한다. 이 메시지를 그대로 쓰면 토스트가 영문 원문을
// 노출하거나, 호출부에서 통째로 swallow 되어 사용자가 아무 피드백을 못 받는다.
const GENERIC_SERVER_MESSAGES = new Set(['internal server error']);

const isGenericServerMessage = (message: string): boolean =>
  GENERIC_SERVER_MESSAGES.has(message.trim().toLowerCase());

const getResponseMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const apiError = payload as ApiErrorResponse;
  return typeof apiError.message === 'string' &&
    apiError.message.trim() &&
    !isGenericServerMessage(apiError.message)
    ? apiError.message
    : null;
};

const getResponseCode = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const apiError = payload as ApiErrorResponse;
  return typeof apiError.code === 'string' && apiError.code.trim()
    ? apiError.code
    : null;
};

// 복구 불가능한 refresh token 상태 코드. 상태 코드와 무관하게 세션을 복구할
// 수 없으므로 로컬 토큰 정리 + 서버 쿠키 만료(/auth/logout)까지 해야 한다.
//   - AUTH-006: refresh token 무효/형식 오류
//   - AUTH-012: 회전형 refresh 재사용 감지. 서버가 쿠키를 만료시키지 않으므로
//     클라가 /auth/logout 으로 HttpOnly 쿠키를 정리하지 않으면, 미들웨어가
//     남은 access 쿠키를 보고 힌트를 재발급해 강제 로그아웃이 되돌려진다.
const INVALID_REFRESH_TOKEN_CODES = new Set(['AUTH-006', 'AUTH-012']);

// 인증 주체(principal) 자체가 무효인 코드. 익명/무효 세션으로 인증 필수
// 엔드포인트를 호출하면 서버가 401 이 아니라 400 으로 내려주므로 상태 코드만으론
// 걸러지지 않는다. 클라 세션 힌트(hasTokens)가 stale 해서 로그아웃 사용자가
// 인증 쿼리를 실행한 상황이라, 401 과 동일하게 조용히 세션 정리 대상으로 본다.
//   - AUTH-001: 인증 정보 없음
//   - AUTH-002: 잘못된 시큐리티 프린시플(INVALID_AUTH_PRINCIPAL)
const INVALID_AUTH_PRINCIPAL_CODES = new Set(['AUTH-001', 'AUTH-002']);

// 백엔드 도메인 에러 코드(예: CHALLENGE_022)를 응답 본문에서 추출한다.
// 상태 코드만으로 구분할 수 없는 분기 처리에 사용한다.
export const getApiErrorCode = (error: unknown): string | null => {
  if (!isAxiosErrorLike(error)) {
    return null;
  }
  return getResponseCode(error.response?.data);
};

export const isUnauthorizedError = (error: unknown): boolean =>
  isAxiosErrorLike(error) && error.response?.status === 401;

export const isRedirectError = (error: unknown): boolean =>
  isAxiosErrorLike(error) && error.response?.status === 302;

// 403. 리프레시/인증 요청이 서버에서 명시적으로 거부된(세션 복구 불가) 경우.
// 회전형 refresh 재사용 감지로 family 가 무효화되면 401 대신 403 으로 응답할 수
// 있어 401 과 동일하게 취급한다. 5xx·429·408·네트워크 오류(일시적)와는 구분한다.
export const isForbiddenError = (error: unknown): boolean =>
  isAxiosErrorLike(error) && error.response?.status === 403;

export const isInvalidRefreshTokenError = (error: unknown): boolean => {
  if (!isAxiosErrorLike(error)) {
    return false;
  }
  const code = getResponseCode(error.response?.data);
  return code !== null && INVALID_REFRESH_TOKEN_CODES.has(code);
};

export const isAuthPrincipalError = (error: unknown): boolean => {
  if (!isAxiosErrorLike(error)) {
    return false;
  }
  const code = getResponseCode(error.response?.data);
  return code !== null && INVALID_AUTH_PRINCIPAL_CODES.has(code);
};

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (isAxiosErrorLike(error)) {
    const status = error.response?.status;
    const payloadMessage = getResponseMessage(error.response?.data);

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return {
          code: error.code,
          message: TIMEOUT_ERROR_MESSAGE,
        };
      }

      return {
        code: error.code,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    return {
      status,
      code: error.code,
      message:
        payloadMessage ||
        (status ? STATUS_ERROR_MESSAGE[status] : null) ||
        DEFAULT_ERROR_MESSAGE,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
    };
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
  };
};
