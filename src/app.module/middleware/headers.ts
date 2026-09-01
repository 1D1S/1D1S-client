import { NextResponse } from 'next/server';

/**
 * 보안 헤더 설정 미들웨어
 * - X-Frame-Options: DENY
 * - Content-Security-Policy: default-src 'self'
 * - Cache-Control: public, max-age=3600
 *
 * @param res NextResponse
 * @param pathname 요청 경로. 캐시 정책 예외 판정에만 쓴다.
 */
export function headersMiddleware(res: NextResponse, pathname = ''): void {
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
      ? `connect-src 'self' ${allowedOrigins.join(' ')} ${kakaoOrigins} ${appleAuthOrigin};`
      : `connect-src 'self' ${kakaoOrigins} ${appleAuthOrigin};`;
  const imgSrcValue = "img-src 'self' blob: data: https: http:;";
  const scriptSrcValue = `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://t1.kakaocdn.net ${appleScriptOrigin};`;
  // 애플 SDK 가 인증 처리에 iframe 을 쓰는 경우가 있어 frame-src 를 명시한다.
  //
  // vercel.live(프리뷰 툴바)는 허용 목록에서 뺐다. 앱 웹뷰에서 이 툴바가
  // 뜨면 탭 시 외부 브라우저가 열려 앱 흐름이 끊긴다. 상용 도메인에는 원래
  // 주입되지 않지만(실측: 상용 HTML 에 vercel.live 스크립트 0건), 프리뷰
  // 배포를 웹뷰로 열면 나타난다. CSP 에서 막아 두면 어느 배포에서도 뜨지
  // 않는다. 프리뷰 코멘트 기능이 필요해지면 Vercel 프로젝트 설정에서
  // 켜는 것과 함께 여기도 되돌려야 한다.
  const frameSrcValue = `frame-src 'self' ${appleAuthOrigin};`;

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
  // 문서(HTML) 응답은 캐시 재검증을 강제한다.
  //
  // 예전 값은 `public, max-age=3600` 이었다 — 두 가지가 잘못됐다:
  //   1. 안드로이드 WebView 는 같은 URL 로드(loadUrl)를 1시간 내내 디스크
  //      캐시로 끝내, pull-to-refresh 가 네트워크 요청 0회로 "완료"됐다.
  //      한 시간 전 SSR HTML(과 그 안의 RSC 데이터)이 그대로 다시 보였다 —
  //      "당겨도 이전 데이터"의 근본 원인. iOS(WebKit)는 메인 리소스를 훨씬
  //      적극적으로 재검증해서 안드로이드에서만 유독 도드라졌다.
  //   2. 로그인 사용자별 HTML 에 `public` 은 공유 캐시(프록시)에 개인화된
  //      문서가 앉을 수 있다는 뜻이다.
  // no-cache 는 "캐시하되 매번 재검증" — ETag/304 로 전송량은 그대로 아끼면서
  // 신선도는 항상 보장된다. 정적 에셋(/_next/static)은 matcher 가 제외하므로
  // 영향 없다.
  //
  // 예외: `/.well-known/*` 은 HTML 문서가 아니라 Apple·Google 검증기가
  // 주기적으로 가져가는 기계용 JSON 이다. 개인화될 일이 없고, 매번 재검증을
  // 강요하면 그 CDN 들이 원본을 계속 두드린다. 라우트 핸들러가 스스로
  // 선언한 값을 그대로 살린다.
  if (pathname.startsWith('/.well-known/')) {
    return;
  }
  res.headers.set('Cache-Control', 'private, no-cache');
}
