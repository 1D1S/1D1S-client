import { NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE_CANDIDATES } from '../utils/tokenCookie';

/**
 * 인증 미들웨어
 * - 상세 페이지(챌린지/일지)는 비로그인 사용자도 열람 가능
 * - 로그인이 필요한 액션(좋아요, 댓글 등)은 클라이언트에서 개별 처리
 *
 * @returns NextResponse | null
 */
const PROTECTED_DETAIL_ROUTES: Array<{
  pattern: RegExp;
  fallback: string;
}> = [
  { pattern: /^\/challenge\/\d+\/?$/, fallback: '/challenge' },
  { pattern: /^\/diary\/\d+\/?$/, fallback: '/diary' },
];

function getFallbackRoute(pathname: string): string | null {
  const matched = PROTECTED_DETAIL_ROUTES.find(({ pattern }) =>
    pattern.test(pathname)
  );
  return matched?.fallback ?? null;
}

export function authMiddleware(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  const fallback = getFallbackRoute(pathname);
  if (!fallback) {
    return null;
  }

  const token = ACCESS_TOKEN_COOKIE_CANDIDATES.map(
    (cookieName) => req.cookies.get(cookieName)?.value
  ).find((value): value is string => Boolean(value?.trim()));

  if (!token) {
    const redirectUrl = new URL(fallback, req.url);
    redirectUrl.searchParams.set('loginRequired', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: JWT 서명/유효성 검증 로직 추가
  return null;
}
