import Cookies from 'js-cookie';

import {
  ACCESS_TOKEN_COOKIE_CANDIDATES,
  AUTH_HINT_COOKIE_DOMAIN,
  AUTH_HINT_COOKIE_NAME,
} from './tokenCookie';

const AUTH_SESSION_KEY = '1d1s:isAuthenticated';
// 서브도메인 간 인증 상태 공유를 위한 힌트 쿠키 (토큰 값 아님, httpOnly 아님)
const AUTH_HINT_COOKIE = AUTH_HINT_COOKIE_NAME;

/**
 * 권위 있는 로그인 판정 상태.
 * - `unknown`: 부팅 세션 확인 전. 로그인/로그아웃 UI 를 확정 렌더하지 말고
 *   스켈레톤으로 둔다. (JS 힌트만으로는 판정 불가한 Safari standalone PWA 대응)
 * - `authenticated`: 서버가 세션 생존을 확인(또는 로그인 성공).
 * - `guest`: 서버가 세션을 거부(또는 로그아웃).
 *
 * 힌트(hasTokens)는 Safari ITP/standalone 웹뷰에서 콜드 스타트 시 소실·지연될
 * 수 있어 첫 진입 로그인 사용자가 게스트로 굳는 원인이었다. 이 상태는 httpOnly
 * 세션 쿠키에 의존하는 서버 확인(GET /auth/token)으로 확정한다. (runAuthBootProbe)
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'guest';
let authStatus: AuthStatus = 'unknown';

/**
 * 실제 access 토큰 쿠키가 JS에서 읽히는지 확인한다.
 * - 개발 환경의 devAccessToken 등 HttpOnly가 아닌 토큰은 여기서 감지된다.
 * - 상용의 HttpOnly accessToken 은 항상 false를 반환하므로,
 *   이 경우는 플래그/힌트 쿠키로 폴백 판정한다.
 */
function hasReadableAccessTokenCookie(): boolean {
  return ACCESS_TOKEN_COOKIE_CANDIDATES.some((name) =>
    Boolean(Cookies.get(name))
  );
}

// 로그인 상태 변화를 구독자에게 알린다. 상태는 JS 에서 반응형이 아니라
// markAuthenticated/clearTokens/settleGuest 로만 바뀌므로, 변경 시점에 명시적으로
// 통지해 useAuthStatus(useSyncExternalStore) 구독자가 즉시 재렌더되게 한다.
type AuthListener = () => void;
const authListeners = new Set<AuthListener>();
const notifyAuthChange = (): void => {
  authListeners.forEach((listener) => listener());
};

// 상태 전이 후 구독자 통지. 값이 같아도 통지는 하되(반복 markAuthenticated 등
// 기존 계약 유지), useAuthStatus 는 useSyncExternalStore 스냅샷이 동일하면
// 재렌더를 건너뛴다.
const setStatus = (next: AuthStatus): void => {
  authStatus = next;
  notifyAuthChange();
};

export const authStorage = {
  subscribe: (listener: AuthListener): (() => void) => {
    authListeners.add(listener);
    return () => {
      authListeners.delete(listener);
    };
  },

  markAuthenticated: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(AUTH_SESSION_KEY, 'true');
    // 서브도메인(local.dev.*)에서도 인증 상태를 감지할 수 있도록 도메인 공유 힌트 쿠키 설정.
    // 만료가 짧으면(7일) 장기 세션에서 힌트만 먼저 사라져 게스트 오인이 생길 수
    // 있어 90일로 둔다. (실제 세션 만료는 백엔드 토큰/401 흐름이 판단)
    Cookies.set(AUTH_HINT_COOKIE, '1', {
      domain: AUTH_HINT_COOKIE_DOMAIN,
      expires: 90,
      sameSite: 'lax',
      secure: window.location.protocol === 'https:',
    });
    setStatus('authenticated');
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
    setStatus('guest');
  },

  /** 현재 권위 있는 로그인 상태. (useAuthStatus 로 구독) */
  getStatus: (): AuthStatus => authStatus,

  /**
   * 부팅 세션 확인이 로그인으로 판정되지 못했을 때 게스트로 확정한다.
   * 이미 authenticated/guest 로 확정된 상태는 덮어쓰지 않는다(레이스 방지).
   */
  settleGuest: (): void => {
    if (authStatus === 'unknown') {
      setStatus('guest');
    }
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
