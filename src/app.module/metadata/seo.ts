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

interface PageMetadataInput {
  title: string;
  description: string;
  // 자기참조 canonical 과 og:url 의 경로('/challenge/12' 등).
  path: string;
  // 리소스의 대표 이미지(S3 썸네일 등). 없으면 기본 OG 이미지로 폴백.
  imageUrl?: string | null;
  type?: 'website' | 'article';
}

/**
 * 페이지별 title/description/OG + **자기참조 canonical** 을 만든다.
 *
 * canonical 을 루트 레이아웃에 두면 모든 하위 페이지가 홈 URL 을 정답으로
 * 선언해 색인에서 "대체 페이지"로 접히므로, 페이지마다 자기 경로로 넣는다.
 * og:url 도 같은 이유로 여기서 채운다 — Next 는 하위에서 openGraph 를
 * 정의하면 부모 openGraph 를 상속하지 않고 통째로 대체하기 때문에,
 * 이 함수를 쓰지 않는 페이지는 루트의 홈 URL 을 그대로 물고 나간다.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl,
  type = 'article',
}: PageMetadataInput): Metadata {
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
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: toAbsoluteUrl(path),
      siteName: SITE_TITLE,
      locale: 'ko_KR',
      type,
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
  category?: string | null;
  challengeType?: string | null;
  goalType?: string | null;
  participationType?: string | null;
  maxParticipantCnt?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  participantCnt?: number | null;
}

// 챌린지 상세는 비인증 GET /challenges/{id} 가 열려 있어(dev tip 248a99d~)
// 게스트 응답으로 제목·설명·썸네일을 그대로 OG 에 채운다. 비공개(403 또는
// 응답의 challengeType=PRIVATE)·예약 전 공식(404)·네트워크 오류는 null 을
// 반환해 루트 기본 OG 로 폴백한다(정보 노출 없음).
export async function fetchPublicChallenge(
  id: string
): Promise<PublicChallengeMeta | null> {
  if (!API_BASE_URL) {
    return null;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 300 },
      // 메타데이터는 없어도 페이지는 떠야 한다 — 행 걸린 백엔드가 RSC 렌더
      // 전체를 잡아두지 않게 한다.
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as {
      data?: {
        challengeSummary?: {
          title?: string;
          thumbnailImage?: string | null;
          challengeType?: string;
          category?: string | null;
          goalType?: string | null;
          participationType?: string | null;
          maxParticipantCnt?: number | null;
          startDate?: string | null;
          endDate?: string | null;
          participantCnt?: number | null;
        };
        challengeDetail?: { description?: string | null };
      };
    };
    const summary = body.data?.challengeSummary;
    // 비공개 챌린지는 제목 한 글자도 싣지 않는다(SEC-1).
    //
    // 이 요청은 **비인증**이라 서버가 잠금을 안 걸면 200 + 상세가 그대로
    // 온다. 그걸 OG 에 넣으면 화면의 비밀번호 게이트와 무관하게 제목·설명이
    // 페이지 소스에 남고, 카톡 등 스크레이퍼가 비공개 챌린지 링크 프리뷰를
    // 만들며, revalidate 캐시로 5분간 모든 방문자에게 같은 값이 나간다.
    // 403 만 믿지 않고 응답 내용으로도 한 번 더 막는다.
    if (summary?.challengeType === 'PRIVATE') {
      return null;
    }
    const title = summary?.title;
    if (!title) {
      return null;
    }
    return {
      title,
      description: body.data?.challengeDetail?.description,
      thumbnailImage: summary?.thumbnailImage,
      category: summary?.category,
      challengeType: summary?.challengeType,
      goalType: summary?.goalType,
      participationType: summary?.participationType,
      maxParticipantCnt: summary?.maxParticipantCnt,
      startDate: summary?.startDate,
      endDate: summary?.endDate,
      participantCnt: summary?.participantCnt,
    };
  } catch {
    return null;
  }
}
