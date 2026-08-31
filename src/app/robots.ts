import { SITE_URL } from '@module/metadata/seo';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // /api/og 는 기본 OG 이미지다. disallow: '/api/' 아래 있으면 크롤러가
      // 링크 프리뷰 이미지를 못 가져오므로 더 구체적인 Allow 로 뚫어 둔다.
      allow: ['/', '/api/og'],
      // 일지는 전부 비공개다. 목록·상세 모두 크롤링 대상에서 제외한다.
      // 나머지는 인증 게이트라 크롤링해도 로그인으로 튕긴다.
      disallow: [
        '/api/',
        '/diary',
        '/login',
        '/signup',
        '/mypage',
        '/member',
        '/notification',
        '/onboarding',
        '/shell',
        '/challenge/create',
      ],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
