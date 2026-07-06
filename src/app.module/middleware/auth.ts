import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '../api/config';
import { buildLoginUrl, RETURN_TO_PARAM } from '../utils/returnTo';
import {
  ACCESS_TOKEN_COOKIE_CANDIDATES,
  AUTH_HINT_COOKIE_SERVER_NAMES,
  buildAuthHintSetCookie,
} from '../utils/tokenCookie';

type ProtectedRoute =
  | { pattern: RegExp; type: 'list-redirect'; fallback: string }
  | { pattern: RegExp; type: 'login-redirect' };

const PROTECTED_ROUTES: ProtectedRoute[] = [
  {
    pattern: /^\/challenge\/\d+\/?$/,
    type: 'list-redirect',
    fallback: '/challenge',
  },
  { pattern: /^\/diary\/\d+\/?$/, type: 'list-redirect', fallback: '/diary' },

  { pattern: /^\/challenge\/\d+\/edit\/?$/, type: 'login-redirect' },
  { pattern: /^\/challenge\/create\/?$/, type: 'login-redirect' },
  { pattern: /^\/mypage(\/.*)?$/, type: 'login-redirect' },
  { pattern: /^\/notification\/?$/, type: 'login-redirect' },
];

export interface AuthCheckResult {
  block?: NextResponse;
  setCookies?: string[];
  cookieHeader?: string;
}

function matchRoute(pathname: string): ProtectedRoute | null {
  return PROTECTED_ROUTES.find(({ pattern }) => pattern.test(pathname)) ?? null;
}

function getAccessToken(req: NextRequest): string | undefined {
  return ACCESS_TOKEN_COOKIE_CANDIDATES.map(
    (cookieName) => req.cookies.get(cookieName)?.value
  ).find((value): value is string => Boolean(value?.trim()));
}

// 도메인 공유 세션 힌트 쿠키(90일). access/refresh 토큰이 만료됐어도 로그인
// 세션의 흔적이 남아 있는지 판정한다. js-cookie 가 이름의 ':' 를 %3A 로
// 인코딩해 저장하므로 인코딩된 이름으로도 조회한다.
function hasSessionHint(req: NextRequest): boolean {
  return AUTH_HINT_COOKIE_SERVER_NAMES.some((name) =>
    Boolean(req.cookies.get(name)?.value?.trim())
  );
}

function buildUnauthorizedResponse(
  req: NextRequest,
  matched: ProtectedRoute
): NextResponse {
  if (matched.type === 'login-redirect') {
    // 로그인 후 원래 가려던 경로로 복귀할 수 있게 returnTo 를 싣는다.
    const loginUrl = buildLoginUrl(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }
  const redirectUrl = new URL(matched.fallback, req.url);
  redirectUrl.searchParams.set('loginRequired', 'true');
  // 목록의 로그인 다이얼로그에서 로그인하면 원래 상세로 복귀하도록 전달
  redirectUrl.searchParams.set(
    RETURN_TO_PARAM,
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(redirectUrl);
}

interface RefreshSuccess {
  setCookies: string[];
  accessTokenCookie: { name: string; value: string };
}

async function refreshTokens(req: NextRequest): Promise<RefreshSuccess | null> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'GET',
      headers: { cookie: cookieHeader },
      redirect: 'manual',
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const setCookies = response.headers.getSetCookie();
  if (setCookies.length === 0) {
    return null;
  }

  let accessTokenCookie: RefreshSuccess['accessTokenCookie'] | null = null;
  for (const cookie of setCookies) {
    const semicolonIdx = cookie.indexOf(';');
    const pair = semicolonIdx === -1 ? cookie : cookie.slice(0, semicolonIdx);
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      continue;
    }
    const name = pair.slice(0, eqIdx).trim();
    if (ACCESS_TOKEN_COOKIE_CANDIDATES.includes(name)) {
      accessTokenCookie = {
        name,
        value: pair.slice(eqIdx + 1).trim(),
      };
    }
  }

  if (!accessTokenCookie) {
    return null;
  }

  return { setCookies, accessTokenCookie };
}

function buildCookieHeaderWithToken(
  originalCookieHeader: string | null,
  tokenName: string,
  tokenValue: string
): string {
  const pairs = (originalCookieHeader ?? '')
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .filter((pair) => !pair.startsWith(`${tokenName}=`));

  pairs.push(`${tokenName}=${tokenValue}`);
  return pairs.join('; ');
}

// 세션이 살아있는데(서버만 읽는 httpOnly access 토큰) Safari ITP 등이 JS 로 쓴
// 힌트 쿠키/localStorage 를 지웠으면, 서버가 힌트를 재발급해 클라이언트가 로그인
// 상태를 스스로 복구하게 한다. 클라이언트는 httpOnly 토큰을 못 읽으므로 힌트가
// 없으면 사이드바 쿼리·resume refresh 가 모두 비활성화돼 게스트로 굳는다.
function restoreSessionHintCookies(req: NextRequest): string[] {
  if (getAccessToken(req) && !hasSessionHint(req)) {
    return [buildAuthHintSetCookie(req.nextUrl.protocol === 'https:')];
  }
  return [];
}

/**
 * 인증 미들웨어
 * - 보호된 경로 진입 시 access 토큰 쿠키 존재 확인
 * - 없으면 백엔드 /auth/token 으로 refresh 시도
 *   - 성공: 새 Set-Cookie를 응답에, 새 access 토큰을 요청 헤더에 주입해 RSC 통과
 *   - 실패: 기존대로 로그인/목록으로 리다이렉트
 * - 유효 토큰 + 힌트 소실 시엔 (공개/보호 무관) 힌트만 재발급해 통과
 */
export async function authMiddleware(
  req: NextRequest
): Promise<AuthCheckResult> {
  const { pathname } = req.nextUrl;
  const matched = matchRoute(pathname);
  const hintCookies = restoreSessionHintCookies(req);
  const passThrough: AuthCheckResult =
    hintCookies.length > 0 ? { setCookies: hintCookies } : {};

  if (!matched) {
    return passThrough;
  }

  if (getAccessToken(req)) {
    return passThrough;
  }

  const refreshed = await refreshTokens(req);
  if (!refreshed) {
    // 서버 refresh 가 실패해도(백엔드 지연, 쿠키 미전달, refresh 토큰 만료
    // 등) 세션 힌트가 있으면 상세 페이지를 튕기지 않고 렌더한다. 클라이언트
    // axios 인터셉터가 401→refresh 로 access 토큰을 복구하고, 그래도 세션이
    // 끝났다면 상세 화면의 LoginRequiredDialog 가 가린다. 목록으로 하드
    // 리다이렉트해 사용자를 잃던 문제(잦은 access 토큰 만료)를 막는다.
    // login-redirect(마이페이지/작성 등 민감 경로)는 기존대로 하드 게이트.
    if (matched.type === 'list-redirect' && hasSessionHint(req)) {
      return {};
    }
    return { block: buildUnauthorizedResponse(req, matched) };
  }

  const newCookieHeader = buildCookieHeaderWithToken(
    req.headers.get('cookie'),
    refreshed.accessTokenCookie.name,
    refreshed.accessTokenCookie.value
  );

  // refresh 성공 = 세션 생존 확정. 일시적 401 레이스로 클라이언트가 지워버린
  // 세션 힌트 쿠키를 여기서 재발급해 자가 치유한다. (힌트가 없으면 사이드바
  // 쿼리가 비활성화돼 클라이언트 스스로는 복구하지 못한다.)
  const setCookies = hasSessionHint(req)
    ? refreshed.setCookies
    : [
        ...refreshed.setCookies,
        buildAuthHintSetCookie(req.nextUrl.protocol === 'https:'),
      ];

  return {
    setCookies,
    cookieHeader: newCookieHeader,
  };
}
