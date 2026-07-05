const PRODUCTION_ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME = 'devAccessToken';

const resolveEnvCookieName = (
  envValue: string | undefined,
  fallbackName: string
): string => {
  const trimmedValue = envValue?.trim();
  return trimmedValue ? trimmedValue : fallbackName;
};

const isDevelopment = process.env.NODE_ENV === 'development';

const defaultAccessTokenCookieName = isDevelopment
  ? DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME
  : PRODUCTION_ACCESS_TOKEN_COOKIE_NAME;

export const ACCESS_TOKEN_COOKIE_NAME = resolveEnvCookieName(
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME,
  defaultAccessTokenCookieName
);

const withFallbacks = (
  primaryName: string,
  fallbackNames: string[]
): string[] => Array.from(new Set([primaryName, ...fallbackNames]));

export const ACCESS_TOKEN_COOKIE_CANDIDATES = withFallbacks(
  ACCESS_TOKEN_COOKIE_NAME,
  [PRODUCTION_ACCESS_TOKEN_COOKIE_NAME, DEVELOPMENT_ACCESS_TOKEN_COOKIE_NAME]
);

// 서브도메인 간 로그인 상태 공유용 힌트 쿠키(토큰 값 아님, httpOnly 아님).
// 클라이언트(authStorage)와 서버(serverAuth) 양쪽에서 참조하므로 js-cookie
// 의존이 없는 이 모듈에 이름 상수를 둔다.
export const AUTH_HINT_COOKIE_NAME = '1d1s:hasSession';

// ⚠️ js-cookie 는 이름의 ':' 를 %3A 로 인코딩해 저장하므로 실제 쿠키 이름은
// `1d1s%3AhasSession` 이다. 서버(next/headers·NextRequest)는 이름을 디코드하지
// 않아 논리 이름으로 조회하면 못 찾는다. 서버는 반드시 이 후보들로 조회한다.
export const AUTH_HINT_COOKIE_SERVER_NAMES = [
  encodeURIComponent(AUTH_HINT_COOKIE_NAME), // '1d1s%3AhasSession'
  AUTH_HINT_COOKIE_NAME, // 혹시 인코딩 안 된 채 저장된 경우 대비
];

// 서브도메인(local.dev.* ↔ 상용) 간 공유 도메인. 클라이언트(js-cookie)와
// 미들웨어(Set-Cookie 문자열)가 동일한 값을 써야 같은 쿠키로 취급된다.
export const AUTH_HINT_COOKIE_DOMAIN = '.1day1streak.com';

const AUTH_HINT_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

/**
 * 미들웨어에서 세션 생존이 확인됐을 때(refresh 성공) 응답에 실어 보낼
 * 힌트 쿠키 Set-Cookie 문자열. 일시적 401 레이스로 클라이언트가 힌트를
 * 지워버린 상태를 서버가 자가 치유하는 용도다.
 */
export function buildAuthHintSetCookie(secure: boolean): string {
  return [
    `${encodeURIComponent(AUTH_HINT_COOKIE_NAME)}=1`,
    `Domain=${AUTH_HINT_COOKIE_DOMAIN}`,
    'Path=/',
    `Max-Age=${AUTH_HINT_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}
