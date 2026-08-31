import { fetchPublicChallengeList, SITE_URL } from '@module/metadata/seo';
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
];

// lastModified 는 넣지 않는다. GET /challenges 응답에 수정 시각
// (updatedAt/createdAt)이 없어서 지금 넣을 수 있는 값은 "사이트맵 생성
// 시각"뿐인데, 그건 실제 갱신과 무관해 Google 이 lastmod 전체를 무시하게
// 만든다. 서버가 목록 항목에 updatedAt 을 실어주면 그때 채운다.
//
// ponytail: 커서 페이지네이션을 끝까지 돌지 않고 첫 페이지만 싣는다.
// 챌린지가 이 수를 넘어 색인 누락이 문제가 되면 그때 while 루프를 붙인다.
const CHALLENGE_SITEMAP_LIMIT = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const challenges = await fetchPublicChallengeList(CHALLENGE_SITEMAP_LIMIT);

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
