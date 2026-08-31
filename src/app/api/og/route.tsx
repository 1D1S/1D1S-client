import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@module/metadata/seo';
import { ImageResponse } from 'next/og';

/**
 * 기본 브랜드 OG 이미지(1200×630) — 연한 프라이머리 배경 + 로고 + 서비스명.
 *
 * 리소스 고유 이미지가 없을 때만 쓴다(챌린지 썸네일이 있으면 그쪽이 og:image).
 * 그래서 제목·설명 같은 문구는 넣지 않는다 — 어떤 페이지에 붙어도 어울려야
 * 하고, 링크 프리뷰에서 글자는 카드 본문이 이미 보여준다.
 *
 * 한글("일디일스")은 next/og 기본 폰트에 글리프가 없어 두부(□)가 된다.
 * 필요한 6글자만 남긴 2KB 서브셋을 함께 싣는다(scripts 없이 pyftsubset 으로
 * 생성, next.config 의 outputFileTracingIncludes 로 함수 번들에 포함).
 */

// 배포마다 바뀌지 않는 정적 이미지다. 매 요청 렌더하지 않도록 캐시한다.
export const dynamic = 'force-static';

const BRAND = '#ff5900';
const FONT_PATH = join(process.cwd(), 'public/fonts/og/Pretendard-Bold.og.otf');

export async function GET(): Promise<ImageResponse> {
  const font = await readFile(FONT_PATH);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
          // main-200 → main-400. 로고가 또렷하게 뜨는 연한 프라이머리 톤.
          background: 'linear-gradient(135deg, #fff6f2 0%, #ffdac7 100%)',
        }}
      >
        <svg
          width="132"
          height="220"
          viewBox="0 0 180 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 294.833V58.0342C0 52.9823 6.4726 50.9325 9.35613 55.0711L174.337 291.87C176.723 295.295 174.285 300 170.124 300H5.14291C2.30256 300 0 297.688 0 294.833Z"
            fill={BRAND}
          />
          <path
            d="M180 294.833V58.0342C180 52.9823 173.527 50.9325 170.644 55.0711L5.66273 291.87C3.27673 295.295 5.71524 300 9.87598 300H174.857C177.697 300 180 297.688 180 294.833Z"
            fill={BRAND}
          />
          <path
            d="M87.5168 1.91788L80.0992 29.865C79.8619 30.7589 79.1668 31.4573 78.2771 31.6958L50.4612 39.1483C47.9159 39.8302 47.9159 43.4591 50.4612 44.1409L78.2771 51.5935C79.1668 51.8319 79.8619 52.5303 80.0992 53.4242L87.5168 81.3713C88.1954 83.9285 91.8073 83.9285 92.4859 81.3713L99.9035 53.4242C100.141 52.5303 100.836 51.8319 101.726 51.5935L129.542 44.1409C132.087 43.4591 132.087 39.8302 129.542 39.1483L101.726 31.6958C100.836 31.4573 100.141 30.7589 99.9035 29.865L92.4859 1.91788C91.8073 -0.639294 88.1954 -0.639294 87.5168 1.91788Z"
            fill={BRAND}
          />
        </svg>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Pretendard',
              fontSize: 104,
              color: BRAND,
              letterSpacing: -2,
            }}
          >
            1D1S
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Pretendard',
              fontSize: 38,
              color: '#ff6b4a',
              letterSpacing: 2,
            }}
          >
            일디일스
          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts: [{ name: 'Pretendard', data: font, weight: 700, style: 'normal' }],
    }
  );
}
