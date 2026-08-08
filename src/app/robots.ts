import { SITE_URL } from '@module/metadata/seo';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
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
