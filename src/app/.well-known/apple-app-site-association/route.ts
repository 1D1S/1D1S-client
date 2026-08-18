import { buildAppleAppSiteAssociation } from '@constants/appLinks';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * iOS Universal Links 검증 파일.
 *
 * **정적 파일이 아니라 라우트 핸들러인 이유**: 이 파일은 확장자가 없어야
 * 하는데(`apple-app-site-association`), `public/` 에 그대로 두면 Next 정적
 * 핸들러가 `application/octet-stream` 으로 내보내고 next.config 의
 * `headers()` 로도 덮이지 않는다(실측 확인). iOS 는 `application/json` 이
 * 아니면 무시한다.
 *
 * 서명(CMS)은 iOS 9 이후 필요 없다. 리다이렉트도 따라가지 않으므로 이
 * 경로가 200 을 직접 돌려줘야 한다 — apex 도메인에서 www 로 튕기면 검증이
 * 실패한다.
 */
export function GET(request: NextRequest): NextResponse {
  const host = request.headers.get('host') ?? '';
  return NextResponse.json(buildAppleAppSiteAssociation(host), {
    headers: {
      'content-type': 'application/json',
      // Apple CDN 이 주기적으로 가져간다. 앱 ID 가 바뀌는 일은 드물지만
      // 잘못 올라간 값이 하루 종일 박혀 있지 않게 짧게 둔다.
      'cache-control': 'public, max-age=3600',
    },
  });
}
