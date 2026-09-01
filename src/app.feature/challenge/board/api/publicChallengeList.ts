import { API_BASE_URL } from '@module/api/config';

import type { ChallengeListResponse, ChallengeStatus } from '../type/challenge';

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
}

export async function fetchPublicChallengePage({
  limit,
  cursor,
  status,
}: PublicChallengePageParams): Promise<ChallengeListResponse> {
  if (!API_BASE_URL) {
    return EMPTY_PAGE;
  }

  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    query.set('cursor', cursor);
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
 * 보드 화면의 기본 필터와 **같은 조건**으로 첫 페이지를 읽는다.
 *
 * 화면이 처음 요청하는 것과 조건이 다르면, 하이드레이션 직후 다른 목록으로
 * 바뀌어 버린다. 그래서 상태 필터를 여기서 맞춘다.
 */
export const BOARD_DEFAULT_STATUSES: ChallengeStatus[] = [
  'UPCOMING',
  'ONGOING',
];

export async function fetchPublicChallengeBoardPage(
  limit: number
): Promise<ChallengeListResponse> {
  return fetchPublicChallengePage({
    limit,
    status: BOARD_DEFAULT_STATUSES,
  });
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
