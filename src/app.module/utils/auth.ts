import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// 쿠키 설정 옵션
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송 (프로덕션)
  sameSite: 'strict' as const, // CSRF 보호
  expires: 7, // 7일 후 만료
};

export const authStorage = {
  // 액세스 토큰 저장
  setAccessToken: (token: string): void => {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      ...COOKIE_OPTIONS,
      expires: 1, // 1일 후 만료 (액세스 토큰은 짧게)
    });
  },

  // 리프레시 토큰 저장
  setRefreshToken: (token: string): void => {
    Cookies.set(REFRESH_TOKEN_KEY, token, COOKIE_OPTIONS);
  },

  // 액세스 토큰 조회
  getAccessToken: (): string | undefined => Cookies.get(ACCESS_TOKEN_KEY),

  // 리프레시 토큰 조회
  getRefreshToken: (): string | undefined => Cookies.get(REFRESH_TOKEN_KEY),

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
  },

  // 토큰 존재 여부 확인
  hasTokens: (): boolean =>
    Boolean(Cookies.get(ACCESS_TOKEN_KEY) && Cookies.get(REFRESH_TOKEN_KEY)),
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
  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload(accessToken);
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
