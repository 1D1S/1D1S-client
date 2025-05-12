import { NextResponse } from 'next/server';

/**
 * 보안 헤더 설정 미들웨어
 * - X-Frame-Options: DENY
 * - Content-Security-Policy: default-src 'self'
 * - Cache-Control: public, max-age=3600
 *
 * @param res NextResponse
 */
export function headersMiddleware(res: NextResponse): void {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Content-Security-Policy', "default-src 'self'");
  // 이 부분은 1시간이 적합한지 논의 필요
  res.headers.set('Cache-Control', 'public, max-age=3600');
}