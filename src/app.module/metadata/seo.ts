import { API_BASE_URL } from '@module/api/config';
import type { Metadata } from 'next';

export const SITE_TITLE = '1Day 1Streak';
export const SITE_DESCRIPTION =
  '매일 하나의 챌린지로 꾸준함을 기록하는 1Day 1Streak';

// next/og 로 생성하는 기본 OG 이미지(1200×630). challenge/diary 에 썸네일이
// 없을 때의 폴백으로도 재사용한다.
export const DEFAULT_OG_IMAGE_PATH = '/api/og';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

function resolveSiteUrl(): URL {
  const rawUrl =
    process.env.NEXT_PUBLIC_WEB_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  try {
    return new URL(rawUrl);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const SITE_URL = resolveSiteUrl();

// og:image / twitter:image 는 도메인 포함 절대 URL 이어야 한다(카톡·트위터).
export function toAbsoluteUrl(path: string): string {
  try {
    return new URL(path, SITE_URL).toString();
  } catch {
    return path;
  }
}

interface ResourceMetadataInput {
  title: string;
  description: string;
  // 리소스의 대표 이미지(S3 썸네일 등). 없으면 기본 OG 이미지로 폴백.
  imageUrl?: string | null;
}

export function buildResourceMetadata({
  title,
  description,
  imageUrl,
}: ResourceMetadataInput): Metadata {
  const isDefault = !imageUrl;
  const absoluteImage = toAbsoluteUrl(imageUrl || DEFAULT_OG_IMAGE_PATH);
  // 기본 이미지만 크기를 아는 값(1200×630)으로 명시한다. S3 썸네일은 크기를
  // 알 수 없어 크롤러가 추론하도록 width/height 를 생략한다.
  const image = isDefault
    ? {
        url: absoluteImage,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: title,
      }
    : { url: absoluteImage, alt: title };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_TITLE,
      locale: 'ko_KR',
      type: 'article',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export interface OfficialChallengeMeta {
  challengeId: number;
  title: string;
  thumbnailImage?: string | null;
}

// 공식 챌린지만 비인증 조회가 열려 있다(/challenges/offset?challengeType=
// OFFICIAL). 개별 /challenges/{id} 는 비인증 400(AUTH-002)이라 목록에서 id 로
// 찾는다. 공식 챌린지는 큐레이션 대상이라 수가 적어 한 페이지(size=100)면
// 충분하다. ponytail: 100개 초과 시에만 페이지네이션 추가.
export async function fetchOfficialChallenge(
  id: string
): Promise<OfficialChallengeMeta | null> {
  if (!API_BASE_URL) {
    return null;
  }
  try {
    const res = await fetch(
      `${API_BASE_URL}/challenges/offset?challengeType=OFFICIAL&size=100`,
      { headers: { accept: 'application/json' }, next: { revalidate: 300 } }
    );
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as {
      data?: { items?: OfficialChallengeMeta[] };
    };
    const items = body.data?.items ?? [];
    return items.find((item) => String(item.challengeId) === id) ?? null;
  } catch {
    return null;
  }
}
