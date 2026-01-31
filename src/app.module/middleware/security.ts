import { NextRequest, NextResponse } from 'next/server';

const blockedBots = [/Googlebot/, /Bingbot/, /Slurp/];
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 1000000;
const ipLog = new Map<string, { count: number; windowStart: number }>();

/**
 * 보안 미들웨어
 * - 봇 차단
 * - Rate Limiting
 *
 * @param req NextRequest
 * @returns NextResponse | null
 */
export function securityMiddleware(req: NextRequest): NextResponse | null {
  const userAgent = req.headers.get('user-agent') ?? '';
  if (blockedBots.some((re) => re.test(userAgent))) {
    return new NextResponse('봇으로 감지되어 차단되었습니다.', { status: 403 });
  }

  const ipHeader = req.headers.get('x-forwarded-for') || '';
  const clientIp = ipHeader.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const record = ipLog.get(clientIp) ?? { count: 0, windowStart: now };

  if (now - record.windowStart < RATE_LIMIT_WINDOW_MS) {
    record.count++;
  } else {
    record.count = 1;
    record.windowStart = now;
  }

  ipLog.set(clientIp, record);
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse('요청이 너무 많습니다.', { status: 429 });
  }

  return null;
}
