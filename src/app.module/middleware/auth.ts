import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '../api/config';
import { buildLoginUrl, RETURN_TO_PARAM } from '../utils/returnTo';
import { ACCESS_TOKEN_COOKIE_CANDIDATES } from '../utils/tokenCookie';

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

/**
 * 인증 미들웨어
 * - 보호된 경로 진입 시 access 토큰 쿠키 존재 확인
 * - 없으면 백엔드 /auth/token 으로 refresh 시도
 *   - 성공: 새 Set-Cookie를 응답에, 새 access 토큰을 요청 헤더에 주입해 RSC 통과
 *   - 실패: 기존대로 로그인/목록으로 리다이렉트
 */
export async function authMiddleware(
  req: NextRequest
): Promise<AuthCheckResult> {
  const { pathname } = req.nextUrl;
  const matched = matchRoute(pathname);
  if (!matched) {
    return {};
  }

  if (getAccessToken(req)) {
    return {};
  }

  const refreshed = await refreshTokens(req);
  if (!refreshed) {
    return { block: buildUnauthorizedResponse(req, matched) };
  }

  const newCookieHeader = buildCookieHeaderWithToken(
    req.headers.get('cookie'),
    refreshed.accessTokenCookie.name,
    refreshed.accessTokenCookie.value
  );

  return {
    setCookies: refreshed.setCookies,
    cookieHeader: newCookieHeader,
  };
}
