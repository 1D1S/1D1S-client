import { NextRequest, NextResponse } from 'next/server';

/**
 * 인증 미들웨어
 * - JWT 토큰을 사용하여 인증 및 권한 검사
 * - 비로그인 시 부모 목록 페이지로 리디렉션 + loginRequired 쿼리 파라미터 전달
 *
 * @param req NextRequest
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

  const token =
    req.cookies.get('accessToken')?.value ??
    req.cookies.get('access_token')?.value ??
    req.cookies.get('JSESSIONID')?.value ??
    req.cookies.get('SESSION')?.value ??
    req.cookies.get('session')?.value;

  if (!token) {
    const redirectUrl = new URL(fallback, req.url);
    redirectUrl.searchParams.set('loginRequired', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  // TODO: JWT 서명/유효성 검증 로직 추가
  return null;
}
