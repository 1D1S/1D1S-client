import Cookies from 'js-cookie';

import { ACCESS_TOKEN_COOKIE_CANDIDATES } from './token-cookie';

const AUTH_SESSION_KEY = '1d1s:isAuthenticated';
// 서브도메인 간 인증 상태 공유를 위한 힌트 쿠키 (토큰 값 아님, httpOnly 아님)
const AUTH_HINT_COOKIE = '1d1s:hasSession';
const AUTH_HINT_COOKIE_DOMAIN = '.1day1streak.com';

/**
 * 실제 access 토큰 쿠키가 JS에서 읽히는지 확인한다.
 * - 개발 환경의 devAccessToken 등 HttpOnly가 아닌 토큰은 여기서 감지된다.
 * - 상용의 HttpOnly accessToken 은 항상 false를 반환하므로,
 *   이 경우는 플래그/힌트 쿠키로 폴백 판정한다.
 */
function hasReadableAccessTokenCookie(): boolean {
  return ACCESS_TOKEN_COOKIE_CANDIDATES.some(
    (name) => Boolean(Cookies.get(name))
  );
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

  // 인증 상태 플래그 제거 (실제 토큰은 백엔드 Set-Cookie/HTTP-only로 관리)
  clearTokens: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
    // 현재 호스트 및 도메인 공유 힌트 쿠키 모두 제거 (localhost 환경에서 domain 옵션으로
    // 저장되지 않은 잔존 쿠키를 완전히 정리하기 위함)
    Cookies.remove(AUTH_HINT_COOKIE);
    Cookies.remove(AUTH_HINT_COOKIE, { domain: AUTH_HINT_COOKIE_DOMAIN });
  },

  /**
   * 토큰 존재 여부 확인 (하이브리드 전략).
   *
   * 1) 실제 access 토큰 쿠키가 JS로 읽히면 → 즉시 true (권위 있는 판정)
   * 2) 읽히지 않으면 → 플래그/힌트 쿠키로 폴백 (HttpOnly 상용 환경 대응)
   *
   * 주의: 2)는 stale 될 수 있으므로 사이드바 API 401 응답 시 즉시
   * clearTokens() 로 정리되어야 한다. (useSidebar 참조)
   */
  hasTokens: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    if (hasReadableAccessTokenCookie()) {
      return true;
    }

    return (
      localStorage.getItem(AUTH_SESSION_KEY) === 'true' ||
      Cookies.get(AUTH_HINT_COOKIE) === '1'
    );
  },
};
