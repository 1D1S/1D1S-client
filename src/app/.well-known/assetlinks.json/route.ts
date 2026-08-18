import { buildAssetLinks } from '@constants/appLinks';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Android App Links 검증 파일.
 *
 * `public/` 에 두어도 확장자 덕분에 Content-Type 은 맞지만, 요청 호스트마다
 * 패키지가 달라야 해서(prod/dev) 라우트 핸들러로 둔다 — AASA 와 같은 자리에
 * 있는 편이 나중에 지문을 추가할 때 찾기도 쉽다.
 *
 * 검증 주체는 기기다(설치 시 `autoVerify`). 리다이렉트 없이 200 이어야 하고,
 * 지문이 하나라도 맞으면 통과한다.
 */
export function GET(request: NextRequest): NextResponse {
  const host = request.headers.get('host') ?? '';
  return NextResponse.json(buildAssetLinks(host), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600',
    },
  });
}
