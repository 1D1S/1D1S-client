import { API_BASE_URL } from '@module/api/config';

import {
  CHALLENGE_SECTIONS,
  pickSectionItems,
  SECTION_LIMIT,
  toSectionParams,
} from '../consts/challengeSections';
import type {
  ChallengeListResponse,
  ChallengeStatus,
  ChallengeTypeFilter,
} from '../type/challenge';

/**
 * 서버에서 인증 없이 읽는 공개 챌린지 목록.
 *
 * 화면의 `useChallengeList`(axios·인증 클라이언트)와 달리 서버 컴포넌트에서
 * 도는 fetch 다. 사이트맵과 보드 초기 HTML 이 같이 쓴다.
 *
 * 반환값을 가공하지 않는 것이 중요하다 — 보드 화면이 이 응답을 그대로
 * React Query 캐시에 심기 때문에, 모양이 조금이라도 다르면 하이드레이션
 * 직후 화면이 다시 그려진다.
 *
 * 실패하면 빈 페이지를 돌려준다. 백엔드가 느려도 /sitemap.xml 과
 * /challenge 는 떠야 한다.
 */

const EMPTY_PAGE: ChallengeListResponse = {
  items: [],
  pageInfo: { limit: 0, hasNextPage: false },
};

interface PublicChallengePageParams {
  limit: number;
  cursor?: string;
  /** 미지정 시 서버 기본(전체). 보드 첫 화면은 모집중·진행중만 본다. */
  status?: ChallengeStatus[];
  /** 'OFFICIAL' 이면 공식 챌린지만. 탐색 화면의 공식 섹션이 쓴다. */
  challengeType?: ChallengeTypeFilter;
  /** 카테고리 하나. 챌린지 탭의 카테고리 섹션이 쓴다. */
  category?: string;
  /** 보상이 걸린 챌린지만. */
  rewardOnly?: boolean;
}

export async function fetchPublicChallengePage({
  limit,
  cursor,
  status,
  challengeType,
  category,
  rewardOnly,
}: PublicChallengePageParams): Promise<ChallengeListResponse> {
  if (!API_BASE_URL) {
    return EMPTY_PAGE;
  }

  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    query.set('cursor', cursor);
  }
  if (challengeType) {
    query.set('challengeType', challengeType);
  }
  if (category) {
    query.set('category', category);
  }
  if (rewardOnly) {
    query.set('rewardOnly', 'true');
  }
  // 배열은 같은 키 반복으로 직렬화한다(challengeBoardApi 와 동일 규칙).
  status?.forEach((value) => query.append('status', value));

  try {
    const res = await fetch(`${API_BASE_URL}/challenges?${query.toString()}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 3_600 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      return EMPTY_PAGE;
    }

    const body = (await res.json()) as { data?: ChallengeListResponse };
    const page = body.data;
    if (!page?.items) {
      return EMPTY_PAGE;
    }

    // 서버가 비공개·삭제·예약 챌린지를 이미 거르지만, 사이트맵과 초기
    // HTML 에 그대로 실리는 값이라 응답으로도 한 번 더 막는다.
    return {
      ...page,
      items: page.items.filter(
        (item) =>
          typeof item?.challengeId === 'number' &&
          Boolean(item.title) &&
          item.challengeType !== 'PRIVATE' &&
          item.deleted !== true
      ),
    };
  } catch {
    return EMPTY_PAGE;
  }
}


/**
 * 탐색 화면 공식 챌린지 섹션의 노출 개수.
 *
 * 서버 컴포넌트(탐색 page)와 클라이언트 훅이 같이 읽어야 해서 여기 둔다 —
 * 훅 파일에 두면 page 가 그 파일을 import 하면서 클라이언트 전용 코드까지
 * RSC 로 끌고 와 빌드가 깨진다.
 */
/**
 * 목록 화면의 기본 상태 필터.
 *
 * 화면이 처음 요청하는 것과 조건이 다르면 하이드레이션 직후 다른 목록으로
 * 바뀐다. 종료된 챌린지를 기본으로 숨기는 규칙이 여기 한 곳에 있다.
 */
export const BOARD_DEFAULT_STATUSES: ChallengeStatus[] = [
  'UPCOMING',
  'ONGOING',
];

export const OFFICIAL_CHALLENGES_LIMIT = 10;

/**
 * 탐색 화면의 공식 챌린지 섹션과 **같은 조건**으로 첫 페이지를 읽는다.
 * (useExploreOfficialChallenges 의 파라미터와 맞춰야 한다.)
 */
export async function fetchPublicOfficialChallengePage(
  limit = OFFICIAL_CHALLENGES_LIMIT
): Promise<ChallengeListResponse> {
  return fetchPublicChallengePage({ limit, challengeType: 'OFFICIAL' });
}

/**
 * 공개 챌린지 **전량**. 커서를 끝까지 따라간다(사이트맵 전용).
 *
 * maxPages 는 무한 루프 방지용 안전핀이다 — 서버가 같은 커서를 계속 주거나
 * hasNextPage 가 안 꺼지는 경우 빌드가 멈추지 않게 한다. 상한에 걸리면
 * 몇 개까지 실었는지 로그로 남긴다(조용한 누락 금지).
 *
 * 상태 필터를 주지 않는다 — 종료된 챌린지도 색인 대상이다.
 */
export async function fetchAllPublicChallenges(
  pageSize = 100,
  maxPages = 50
): Promise<ChallengeListResponse['items']> {
  const all: ChallengeListResponse['items'] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const { items, pageInfo } = await fetchPublicChallengePage({
      limit: pageSize,
      cursor,
    });
    all.push(...items);

    const next = pageInfo.hasNextPage ? pageInfo.nextCursor : undefined;
    if (!next || seenCursors.has(next)) {
      return all;
    }
    seenCursors.add(next);
    cursor = next;
  }

  console.warn(
    `[sitemap] 공개 챌린지가 ${maxPages}페이지(${all.length}건)를 넘어 나머지를 싣지 못했습니다.`
  );
  return all;
}

/**
 * 챌린지 탭 홈의 줄 전부를 서버에서 읽는다.
 *
 * 줄이 열한 개지만 각 응답이 `revalidate` 로 캐시되므로 백엔드로 나가는
 * 요청은 한 시간에 열한 번뿐이다. 앞줄만 싣고 나머지를 클라이언트에
 * 맡기면 두 가지를 잃는다 — 초기 HTML 의 챌린지 수(색인)와, 뒷줄이
 * 뒤늦게 붙으며 생기는 화면 밀림.
 *
 * 병렬로 부르고, 한 줄이 실패해도 나머지는 그대로 낸다(빈 페이지 폴백).
 */
export async function fetchPublicChallengeSections(): Promise<
  Array<{ sectionId: string; items: ChallengeListResponse['items'] }>
> {
  const sections = CHALLENGE_SECTIONS;
  const pages = await Promise.all(
    sections.map((section) => {
      const params = toSectionParams(section);
      return fetchPublicChallengePage({
        limit: params.limit ?? SECTION_LIMIT,
        status: params.status,
        category: params.category,
        rewardOnly: params.rewardOnly,
      });
    })
  );

  // 빈 줄도 **그대로 돌려준다**. 여기서 걸러 내면 화면은 그 줄을 "아직
  // 안 온 것"으로 보고 거기서 멈춘다 — 보상 섹션이 비는 순간 초기 HTML 이
  // 통째로 스켈레톤이 됐다. 빈 줄은 화면이 안 그린다(줄째 생략).
  return sections.map((section, index) => ({
    sectionId: section.id,
    items: pickSectionItems(section, pages[index]?.items ?? []),
  }));
}
