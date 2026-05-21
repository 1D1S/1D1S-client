import { NextRequest, NextResponse } from 'next/server';

import { authMiddleware } from './auth';
import { headersMiddleware } from './headers';
import { loggingMiddleware } from './logging';
import { redirectMiddleware } from './redirect';
import { securityMiddleware } from './security';

function applyRefreshedCookies(
  response: NextResponse,
  setCookies: string[] | undefined
): void {
  if (!setCookies) {
    return;
  }
  for (const cookie of setCookies) {
    response.headers.append('set-cookie', cookie);
  }
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  // 1. 로깅 시작
  const start = loggingMiddleware(req);

  // 2. 보안 검사 (봇 차단 + Rate Limiting)
  const blocked = securityMiddleware(req);
  if (blocked) {
    return blocked;
  }

  // 3. 인증 및 권한 검사 (필요 시 토큰 refresh)
  const auth = await authMiddleware(req);
  if (auth.block) {
    return auth.block;
  }

  // 4. 리디렉션/리라이트 처리
  const redirectRes = redirectMiddleware(req);
  if (redirectRes) {
    applyRefreshedCookies(redirectRes, auth.setCookies);
    return redirectRes;
  }

  // 5. refresh 로 새 access 토큰을 받았으면 RSC 가 볼 수 있도록 요청 헤더 갱신
  const requestHeaders = auth.cookieHeader
    ? new Headers(req.headers)
    : undefined;
  if (requestHeaders && auth.cookieHeader) {
    requestHeaders.set('cookie', auth.cookieHeader);
  }

  // 6. 기본 응답 및 헤더 설정
  const response = requestHeaders
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.next();

  applyRefreshedCookies(response, auth.setCookies);
  headersMiddleware(response);

  // 7. 응답 시간 로깅
  console.log(`Response Time: ${Date.now() - start}ms`);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
