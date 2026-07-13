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

export interface PublicChallengeMeta {
  title: string;
  description?: string | null;
  thumbnailImage?: string | null;
}

// 챌린지 상세는 비인증 GET /challenges/{id} 가 열려 있어(dev tip 248a99d~)
// 게스트 응답으로 제목·설명·썸네일을 그대로 OG 에 채운다. 비공개(403)·예약 전
// 공식(404)·네트워크 오류는 null 을 반환해 루트 기본 OG 로 폴백한다(정보
// 노출 없음).
export async function fetchPublicChallengeMeta(
  id: string
): Promise<PublicChallengeMeta | null> {
  if (!API_BASE_URL) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as {
      data?: {
        challengeSummary?: { title?: string; thumbnailImage?: string | null };
        challengeDetail?: { description?: string | null };
      };
    };
    const title = body.data?.challengeSummary?.title;
    if (!title) {
      return null;
    }
    return {
      title,
      description: body.data?.challengeDetail?.description,
      thumbnailImage: body.data?.challengeSummary?.thumbnailImage,
    };
  } catch {
    return null;
  }
}
