import Cookies from 'js-cookie';

import {
  ACCESS_TOKEN_COOKIE_CANDIDATES,
  REFRESH_TOKEN_COOKIE_CANDIDATES,
} from './token-cookie';

const AUTH_SESSION_KEY = '1d1s:isAuthenticated';
// 서브도메인 간 인증 상태 공유를 위한 힌트 쿠키 (토큰 값 아님, httpOnly 아님)
const AUTH_HINT_COOKIE = '1d1s:hasSession';
const AUTH_HINT_COOKIE_DOMAIN = '.1day1streak.com';
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
    localStorage.setItem(AUTH_SESSION_KEY, 'true');
    // 서브도메인(local.dev.*)에서도 인증 상태를 감지할 수 있도록 도메인 공유 힌트 쿠키 설정
    Cookies.set(AUTH_HINT_COOKIE, '1', {
      domain: AUTH_HINT_COOKIE_DOMAIN,
      expires: 7,
      sameSite: 'lax',
      secure: window.location.protocol === 'https:',
    });
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
  getAccessToken: (): string | undefined => {
    for (const cookieName of ACCESS_TOKEN_COOKIE_CANDIDATES) {
      const token = normalizeCookieValue(Cookies.get(cookieName));
      if (token) {
        return token;
      }
    }
    return undefined;
  },

  // 리프레시 토큰 조회
  getRefreshToken: (): string | undefined => {
    for (const cookieName of REFRESH_TOKEN_COOKIE_CANDIDATES) {
      const token = normalizeCookieValue(Cookies.get(cookieName));
      if (token) {
        return token;
      }
    }
    return undefined;
  },

  // 액세스 토큰 제거
  removeAccessToken: (): void => {
    for (const cookieName of ACCESS_TOKEN_COOKIE_CANDIDATES) {
      Cookies.remove(cookieName);
    }
  },

  // 리프레시 토큰 제거
  removeRefreshToken: (): void => {
    for (const cookieName of REFRESH_TOKEN_COOKIE_CANDIDATES) {
      Cookies.remove(cookieName);
    }
  },

  // 모든 토큰 제거
  clearTokens: (): void => {
    for (const cookieName of ACCESS_TOKEN_COOKIE_CANDIDATES) {
      Cookies.remove(cookieName);
    }
    for (const cookieName of REFRESH_TOKEN_COOKIE_CANDIDATES) {
      Cookies.remove(cookieName);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
    Cookies.remove(AUTH_HINT_COOKIE, { domain: AUTH_HINT_COOKIE_DOMAIN });
  },

  // 토큰 존재 여부 확인
  // HTTP-only 쿠키는 JS에서 읽을 수 없으므로 localStorage 플래그 또는 힌트 쿠키로 판단
  // 힌트 쿠키는 도메인 .1day1streak.com 으로 서브도메인 간 공유됨
  hasTokens: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      localStorage.getItem(AUTH_SESSION_KEY) === 'true' ||
      Cookies.get(AUTH_HINT_COOKIE) === '1'
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
