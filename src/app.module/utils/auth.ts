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
