import { CHALLENGE_SEARCH_PARAM } from '@constants/challengeSearch';
import React from 'react';

import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  toAbsoluteUrl,
} from './seo';

/**
 * schema.org 구조화 데이터(JSON-LD).
 *
 * 검색 리치 결과뿐 아니라 AI 답변엔진이 페이지를 "무엇에 대한 문서인지"
 * 파악하는 근거로 쓴다. 서버 컴포넌트라 초기 HTML 에 그대로 실린다.
 *
 * `<`를 이스케이프하는 이유: 챌린지 제목·설명은 사용자 입력이라
 * `</script>` 가 섞이면 스크립트 블록이 조기 종료된다.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown>;
}): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll('<', '\\u003c'),
      }}
    />
  );
}

const ORGANIZATION_ID = `${SITE_URL.origin}/#organization`;

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_TITLE,
    alternateName: ['1D1S', '일디일스'],
    url: SITE_URL.toString(),
    logo: toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH),
    description: SITE_DESCRIPTION,
  };
}

/**
 * WebSite + SearchAction.
 *
 * 챌린지 검색이 `/challenge?keyword=` 로 주소를 갖게 되면서 검색엔진이
 * 사이트 내 검색으로 바로 보낼 수 있다. 쿼리 키는 화면과 같은 상수를 쓴다.
 */
export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL.toString(),
    name: SITE_TITLE,
    alternateName: ['1D1S', '일디일스'],
    description: SITE_DESCRIPTION,
    inLanguage: 'ko-KR',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: toAbsoluteUrl(
          `/challenge?${CHALLENGE_SEARCH_PARAM}={search_term_string}`
        ),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

interface ChallengeJsonLdInput {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  participantCnt?: number | null;
}

// 기한 없는 챌린지의 종료일 센티넬(9999-12-31)은 구조화 데이터에 싣지 않는다.
const ENDLESS_YEAR_PREFIX = '9999';

/**
 * 챌린지 상세 = Event.
 *
 * 시작·종료일이 있고 사람이 모여 참여하는 단위라 Event 가 가장 가깝다.
 * 온라인 전용이므로 eventAttendanceMode 를 OnlineEventAttendanceMode 로 두고
 * location 에 접속 URL 을 넣는다(Event 스키마가 location 을 요구한다).
 */
export function buildChallengeJsonLd({
  id,
  title,
  description,
  imageUrl,
  startDate,
  endDate,
  participantCnt,
}: ChallengeJsonLdInput): Record<string, unknown> {
  const url = toAbsoluteUrl(`/challenge/${id}`);
  const hasEndDate =
    Boolean(endDate) && !endDate?.startsWith(ENDLESS_YEAR_PREFIX);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    url,
    description: description?.trim() || SITE_DESCRIPTION,
    image: toAbsoluteUrl(imageUrl || DEFAULT_OG_IMAGE_PATH),
    inLanguage: 'ko-KR',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    ...(startDate ? { startDate } : {}),
    ...(hasEndDate ? { endDate } : {}),
    location: {
      '@type': 'VirtualLocation',
      url,
    },
    organizer: { '@id': ORGANIZATION_ID },
    ...(typeof participantCnt === 'number'
      ? {
          // 참여자 수는 Event 표준 속성이 아니라 InteractionCounter 로 싣는다.
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/JoinAction',
            userInteractionCount: participantCnt,
          },
        }
      : {}),
  };
}

export function buildFaqJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'ko-KR',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

interface ArticleJsonLdInput {
  slug: string;
  title: string;
  description: string;
  updated: string;
}

/** 주제별 가이드 글 = Article. 작성자는 서비스 자신(Organization)이다. */
export function buildArticleJsonLd({
  slug,
  title,
  description,
  updated,
}: ArticleJsonLdInput): Record<string, unknown> {
  const url = toAbsoluteUrl(`/guide/${slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'ko-KR',
    datePublished: updated,
    dateModified: updated,
    image: toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH),
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildBreadcrumbJsonLd(
  trail: ReadonlyArray<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: toAbsoluteUrl(path),
    })),
  };
}
