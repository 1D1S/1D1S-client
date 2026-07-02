export const RETURN_TO_PARAM = 'returnTo';

const STORAGE_KEY = '1d1s:return-to';

/**
 * 로그인 후 복귀 경로 검증 (open redirect 방지).
 * `/` 로 시작하는 상대 경로만 허용하고, `//`·`/\`(스킴 상대 URL)와
 * 로그인/회원가입 자기 자신(무한 루프)은 거부한다. 무효 값은 null.
 */
export function sanitizeReturnTo(
  value: string | null | undefined
): string | null {
  if (!value || !value.startsWith('/')) {
    return null;
  }
  if (value.startsWith('//') || value.startsWith('/\\')) {
    return null;
  }
  if (/^\/(login|signup)([/?#]|$)/.test(value)) {
    return null;
  }
  return value;
}

/** returnTo 를 실은 로그인 페이지 URL. 값이 무효면 `/login`. */
export function buildLoginUrl(returnTo?: string | null): string {
  const target = sanitizeReturnTo(returnTo);
  if (!target) {
    return '/login';
  }
  return `/login?${RETURN_TO_PARAM}=${encodeURIComponent(target)}`;
}

/**
 * 현재 위치(pathname + search)를 returnTo 로 실은 로그인 URL.
 * 클라이언트 전용 — SSR 에서는 `/login` 을 반환한다.
 */
export function loginUrlFromCurrentLocation(): string {
  if (typeof window === 'undefined') {
    return '/login';
  }
  return buildLoginUrl(window.location.pathname + window.location.search);
}

/**
 * OAuth 왕복 동안 returnTo 를 보존하는 저장소.
 * 소셜 인증 서버를 갔다 오면 쿼리 파라미터가 유실되므로, 소셜 로그인
 * 버튼을 누르는 시점에 sessionStorage 로 옮겨 보존한다.
 */
export const returnToStorage = {
  /** 소셜 로그인 시작 시 호출. 값이 없거나 무효면 이전 값을 지운다. */
  save(value: string | null | undefined): void {
    if (typeof window === 'undefined') {
      return;
    }
    const target = sanitizeReturnTo(value);
    if (target) {
      window.sessionStorage.setItem(STORAGE_KEY, target);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  },
  /** 로그인 성공 시 1회 소비 — 꺼낸 뒤 즉시 삭제한다. */
  consume(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return sanitizeReturnTo(value);
  },
};
