import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_SESSION_KEY = '1d1s:isAuthenticated';
const INVALID_COOKIE_VALUES = new Set(['', 'undefined', 'null']);

function normalizeCookieValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || INVALID_COOKIE_VALUES.has(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export const authStorage = {
  markAuthenticated: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    // 신규 Set-Cookie 모델에서 사용하지 않는 레거시 토큰 쿠키 정리
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.setItem(AUTH_SESSION_KEY, 'true');
  },

  // 액세스 토큰 저장
  setAccessToken: (token: string): void => {
    void token;
    // 백엔드 Set-Cookie(HTTP-only) 인증으로 전환되어 토큰은 프론트에서 저장하지 않음
    authStorage.markAuthenticated();
  },

  // 리프레시 토큰 저장
  setRefreshToken: (token: string): void => {
    void token;
    // 백엔드 Set-Cookie(HTTP-only) 인증으로 전환되어 토큰은 프론트에서 저장하지 않음
    authStorage.markAuthenticated();
  },

  // 액세스 토큰 조회
  getAccessToken: (): string | undefined =>
    normalizeCookieValue(Cookies.get('access_token')) ??
    normalizeCookieValue(Cookies.get(ACCESS_TOKEN_KEY)),

  // 리프레시 토큰 조회
  getRefreshToken: (): string | undefined =>
    normalizeCookieValue(Cookies.get('refresh_token')) ??
    normalizeCookieValue(Cookies.get(REFRESH_TOKEN_KEY)),

  // 액세스 토큰 제거
  removeAccessToken: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
  },

  // 리프레시 토큰 제거
  removeRefreshToken: (): void => {
    Cookies.remove(REFRESH_TOKEN_KEY);
  },

  // 모든 토큰 제거
  clearTokens: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  },

  // 토큰 존재 여부 확인
  hasTokens: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      localStorage.getItem(AUTH_SESSION_KEY) === 'true' ||
      Boolean(authStorage.getAccessToken())
    );
  },
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );

    const decodedPayload =
      typeof window !== 'undefined'
        ? window.atob(paddedPayload)
        : Buffer.from(paddedPayload, 'base64').toString('utf-8');

    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return null;
}

export function getCurrentMemberId(): number | null {
  const accessToken = authStorage.getAccessToken();
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  if (!payload) {
    return null;
  }

  const candidateKeys = [
    'memberId',
    'member_id',
    'userId',
    'user_id',
    'id',
    'sub',
  ] as const;

  for (const key of candidateKeys) {
    const parsedValue = parsePositiveNumber(payload[key]);
    if (parsedValue !== null) {
      return parsedValue;
    }
  }

  return null;
}
