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
  // Sign in with Apple(웹) — SDK 스크립트는 cdn-apple, 인증 호출/프레임은
  // appleid.apple.com. (팝업 자체는 top-level 이라 CSP 대상 아님)
  const appleScriptOrigin = 'https://appleid.cdn-apple.com';
  const appleAuthOrigin = 'https://appleid.apple.com';
  const connectSrcValue =
    allowedOrigins.length > 0
      ? `connect-src 'self' ${allowedOrigins.join(' ')} ${kakaoOrigins} ${appleAuthOrigin} https://vercel.live https://*.vercel.live;`
      : `connect-src 'self' ${kakaoOrigins} ${appleAuthOrigin} https://vercel.live https://*.vercel.live;`;
  const imgSrcValue = "img-src 'self' blob: data: https: http:;";
  const scriptSrcValue =
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://t1.kakaocdn.net ${appleScriptOrigin} https://vercel.live https://*.vercel.live;`;
  // 애플 SDK 가 인증 처리에 iframe 을 쓰는 경우가 있어 frame-src 를 명시한다.
  // vercel.live 는 이미 script-src/connect-src 에서 허용 중인 Vercel 프리뷰
  // 툴바다. frame-src 명시 전에는 default-src 'self' 폴백으로 막혀 있었고,
  // 같은 의도를 유지하려 여기서도 함께 허용한다(프리뷰 툴바 iframe 용).
  const frameSrcValue =
    `frame-src 'self' ${appleAuthOrigin} https://vercel.live https://*.vercel.live;`;

  // const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    ${connectSrcValue}
    ${scriptSrcValue}
    ${frameSrcValue}
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
