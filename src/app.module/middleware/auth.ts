import { NextRequest, NextResponse } from 'next/server';

/**
 * 인증 미들웨어
 * - JWT 토큰을 사용하여 인증 및 권한 검사
 * - 로그인 페이지로 리디렉션
 *
 * @param req NextRequest
 * @returns NextResponse | null
 */
const protectedRoutes = ['/test'];

export function authMiddleware(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  const token = req.cookies.get('access_token')?.value;
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    // 접근했던 페이지를 기억했다가 로그인 후에 리디렉션 하기 위해 추가.
    // pathname을 쿼리 파라미터로 추가
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // TODO: JWT 서명/유효성 검증 로직 추가
  return null;
}
