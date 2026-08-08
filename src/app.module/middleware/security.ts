import { NextRequest, NextResponse } from 'next/server';

// 주의: Googlebot/Bingbot 을 여기 넣으면 사이트 전체가 검색엔진에서
// 색인 제외된다(SEO 메타데이터 레이어 전부 무력화). 차단은 실제 악성
// 크롤러에만 한정할 것.
const blockedBots: RegExp[] = [];
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 1000000;
const MAX_TRACKED_IPS = 10_000;
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

  // 만료된 IP 엔트리를 정리해 맵이 무한히 커지는 것을 막는다.
  if (ipLog.size >= MAX_TRACKED_IPS) {
    for (const [ip, entry] of ipLog) {
      if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
        ipLog.delete(ip);
      }
    }
  }

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
