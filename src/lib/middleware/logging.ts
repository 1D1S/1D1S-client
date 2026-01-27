// File: middleware/logging.ts
import { NextRequest } from 'next/server';

/**
 * 로깅 미들웨어
 * - 요청 메소드, URL, IP 주소를 로그로 남김
 *
 * @param req NextRequest
 * @returns number - 요청 시작 시간
 */
export function loggingMiddleware(req: NextRequest): number {
  const start = Date.now();
  const ipHeader = req.headers.get('x-forwarded-for') || '';
  const ip = ipHeader.split(',')[0].trim() || 'unknown';
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.nextUrl.pathname} - IP: ${ip}`
  );
  return start;
}