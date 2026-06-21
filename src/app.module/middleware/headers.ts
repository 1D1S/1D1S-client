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
  const envUrls = [
    process.env.NEXT_PUBLIC_ODOS_API_URL,
    process.env.NEXT_PUBLIC_ODOS_IMAGE_URL,
    process.env.NEXT_PUBLIC_ODOS_IMAGE_BASE_URL,
  ];
  const allowedOrigins = Array.from(
    new Set(
      envUrls
        .map((url) => {
          if (!url) {
            return null;
          }

          try {
            return new URL(url).origin;
          } catch {
            return null;
          }
        })
        .filter((origin): origin is string => Boolean(origin))
    )
  );
  // 카카오 공유(JS SDK) 도메인 — SDK 스크립트 + API 호출 허용에 사용한다.
  const kakaoOrigins = 'https://t1.kakaocdn.net https://*.kakao.com';
  const connectSrcValue =
    allowedOrigins.length > 0
      ? `connect-src 'self' ${allowedOrigins.join(' ')} ${kakaoOrigins} https://vercel.live https://*.vercel.live;`
      : `connect-src 'self' ${kakaoOrigins} https://vercel.live https://*.vercel.live;`;
  const imgSrcValue = "img-src 'self' blob: data: https: http:;";
  const scriptSrcValue =
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://t1.kakaocdn.net https://vercel.live https://*.vercel.live;";

  // const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    ${connectSrcValue}
    ${scriptSrcValue}
    style-src 'self' 'unsafe-inline';
    ${imgSrcValue}
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://sharer.kakao.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
  res.headers.set('X-Frame-Options', 'DENY');
  // res.headers.set('x-nonce', nonce);
  res.headers.set(
    'Content-Security-Policy',
    cspHeader.replace(/\s{2,}/g, ' ').trim()
  );
  // 이 부분은 1시간이 적합한지 논의 필요
  res.headers.set('Cache-Control', 'public, max-age=3600');
}
