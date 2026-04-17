import Cookies from 'js-cookie';

const AUTH_SESSION_KEY = '1d1s:isAuthenticated';
// 서브도메인 간 인증 상태 공유를 위한 힌트 쿠키 (토큰 값 아님, httpOnly 아님)
const AUTH_HINT_COOKIE = '1d1s:hasSession';
const AUTH_HINT_COOKIE_DOMAIN = '.1day1streak.com';

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

  // 인증 상태 플래그 제거 (실제 토큰은 백엔드 Set-Cookie/HTTP-only로 관리)
  clearTokens: (): void => {
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
