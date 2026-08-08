import { API_BASE_URL } from '@module/api/config';
import { SITE_URL } from '@module/metadata/seo';
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

// ponytail: 커서 페이지네이션을 끝까지 돌지 않고 첫 페이지만 싣는다.
// 챌린지가 이 수를 넘어 색인 누락이 문제가 되면 그때 while 루프를 붙인다.
const CHALLENGE_SITEMAP_LIMIT = 100;

// 공개 목록(GET /challenges)을 비인증으로 조회한다. 실패하면 정적 경로만
// 담긴 사이트맵을 내보낸다 — 백엔드가 느려도 /sitemap.xml 은 200 이어야 한다.
async function fetchPublicChallengeIds(): Promise<number[]> {
  if (!API_BASE_URL) {
    return [];
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/challenges?limit=${CHALLENGE_SITEMAP_LIMIT}`,
      {
        headers: { accept: 'application/json' },
        next: { revalidate: 3_600 },
        signal: AbortSignal.timeout(5_000),
      }
    );
    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as {
      data?: { items?: Array<{ challengeId?: number }> };
    };

    return (body.data?.items ?? [])
      .map((item) => item.challengeId)
      .filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const challengeIds = await fetchPublicChallengeIds();

  return [
    ...PUBLIC_PATHS.map((path) => ({
      url: new URL(path, SITE_URL).toString(),
      changeFrequency: path === '/' ? ('daily' as const) : ('weekly' as const),
      priority: path === '/' ? 1 : 0.7,
    })),
    ...challengeIds.map((id) => ({
      url: new URL(`/challenge/${id}`, SITE_URL).toString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
