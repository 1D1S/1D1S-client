import { GUIDE_ARTICLE_SLUGS } from '@feature/guide/consts/guideArticles';
import { fetchAllPublicChallenges, SITE_URL } from '@module/metadata/seo';
import type { MetadataRoute } from 'next';

// 일지는 전부 비공개라 목록·상세 모두 제외한다(robots.ts 에서도 disallow).
const PUBLIC_PATHS = [
  '/',
  '/explore',
  '/challenge',
  '/guide',
  '/guide/official',
  '/notice',
  '/install',
  '/inquiry',
  '/terms',
  '/privacy',
  '/account-deletion',
  ...GUIDE_ARTICLE_SLUGS.map((slug) => `/guide/${slug}`),
];

// lastModified 는 넣지 않는다. GET /challenges 응답에 수정 시각
// (updatedAt/createdAt)이 없어서 지금 넣을 수 있는 값은 "사이트맵 생성
// 시각"뿐인데, 그건 실제 갱신과 무관해 Google 이 lastmod 전체를 무시하게
// 만든다. 서버가 목록 항목에 updatedAt 을 실어주면 그때 채운다.

// 커서를 끝까지 따라가 공개 챌린지를 전부 싣는다. 한 번에 받는 페이지 크기.
const CHALLENGE_PAGE_SIZE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const challenges = await fetchAllPublicChallenges(CHALLENGE_PAGE_SIZE);

  return [
    ...PUBLIC_PATHS.map((path) => ({
      url: new URL(path, SITE_URL).toString(),
      changeFrequency: path === '/' ? ('daily' as const) : ('weekly' as const),
      priority: path === '/' ? 1 : 0.7,
    })),
    ...challenges.map(({ challengeId }) => ({
      url: new URL(`/challenge/${challengeId}`, SITE_URL).toString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
