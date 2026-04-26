import { NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE_CANDIDATES } from '../utils/tokenCookie';

type ProtectedRoute =
  | { pattern: RegExp; type: 'list-redirect'; fallback: string }
  | { pattern: RegExp; type: 'login-redirect' };

/**
 * 인증 미들웨어
 * - JWT 토큰을 사용하여 인증 및 권한 검사
 * - list-redirect: 비로그인 시 부모 목록 + loginRequired 쿼리 파라미터로 리디렉션
 * - login-redirect: 비로그인 시 /login으로 바로 리디렉션
 *
 * @returns NextResponse | null
 */
const PROTECTED_ROUTES: ProtectedRoute[] = [
  { pattern: /^\/challenge\/\d+\/?$/, type: 'list-redirect', fallback: '/challenge' },
  { pattern: /^\/diary\/\d+\/?$/,    type: 'list-redirect', fallback: '/diary' },

  { pattern: /^\/challenge\/\d+\/edit\/?$/, type: 'login-redirect' },
  { pattern: /^\/challenge\/create\/?$/,    type: 'login-redirect' },
  { pattern: /^\/mypage(\/.*)?$/,           type: 'login-redirect' },
];

function matchRoute(pathname: string): ProtectedRoute | null {
  return PROTECTED_ROUTES.find(({ pattern }) => pattern.test(pathname)) ?? null;
}

export function authMiddleware(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  const matched = matchRoute(pathname);
  if (!matched) {
    return null;
  }

  const token = ACCESS_TOKEN_COOKIE_CANDIDATES.map(
    (cookieName) => req.cookies.get(cookieName)?.value
  ).find((value): value is string => Boolean(value?.trim()));

  if (!token) {
    if (matched.type === 'login-redirect') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const redirectUrl = new URL(matched.fallback, req.url);
    redirectUrl.searchParams.set('loginRequired', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: JWT 서명/유효성 검증 로직 추가
  return null;
}
