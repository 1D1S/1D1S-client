import { NextRequest, NextResponse } from 'next/server';

// 정적 리디렉션을 위한 매핑
const redirectMapping: Record<string, string> = {};

/**
 * 리디렉션 및 리라이트 처리 미들웨어
 * - 정적 리디렉션
 * - 동적 리라이트
 *
 * @param req NextRequest
 * @returns NextResponse | null
 */
export function redirectMiddleware(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  // 정적 리디렉션
  if (redirectMapping[pathname]) {
    return NextResponse.redirect(new URL(redirectMapping[pathname], req.url));
  }

  // 동적 리라이트
  // 현재로서는 크게 필요하지 않지만, 나중을 위해 예시로 작성
  // if (pathname.startsWith('/challenge')) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = `/api/challenge-v2${pathname.slice('/challenge'.length)}`;
  //   return NextResponse.rewrite(url);
  // }
  return null;
}
