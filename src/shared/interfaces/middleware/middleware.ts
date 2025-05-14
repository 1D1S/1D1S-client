import { NextRequest, NextResponse } from 'next/server';
import { loggingMiddleware } from '@/shared/interfaces/middleware/logging';
import { authMiddleware } from '@/shared/interfaces/middleware/auth';
import { securityMiddleware } from '@/shared/interfaces/middleware/security';
import { redirectMiddleware } from '@/shared/interfaces/middleware/redirect';
import { headersMiddleware } from '@/shared/interfaces/middleware/headers';

export function middleware(req: NextRequest): NextResponse {
  // 1. 로깅 시작
  const start = loggingMiddleware(req);

  // 2. 보안 검사 (봇 차단 + Rate Limiting)
  const blocked = securityMiddleware(req);
  if (blocked) {
    return blocked;
  }

  // 3. 인증 및 권한 검사
  const authRes = authMiddleware(req);
  if (authRes) {
    return authRes;
  }

  // 4. 리디렉션/리라이트 처리
  const redirectRes = redirectMiddleware(req);
  if (redirectRes) {
    return redirectRes;
  }

  // 6. 기본 응답 및 헤더 설정
  const response = NextResponse.next();
  headersMiddleware(response);

  // 7. 응답 시간 로깅
  console.log(`Response Time: ${Date.now() - start}ms`);
  return response;
}

export const config = {
  matcher: ['/:path*'],
};
