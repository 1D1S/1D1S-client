import { useQueries } from '@tanstack/react-query';

import { challengeBoardApi } from '../api/challengeBoardApi';
import type { ChallengeSection } from '../consts/challengeSections';
import {
  CHALLENGE_SECTIONS,
  pickSectionItems,
  toSectionParams,
} from '../consts/challengeSections';
import { CHALLENGE_QUERY_KEYS } from '../consts/queryKeys';
import type { ChallengeListItem } from '../type/challenge';

export interface ChallengeSectionResult {
  section: ChallengeSection;
  items: ChallengeListItem[];
}

export interface UseCategorySectionsResult {
  /** 그릴 줄만 남는다 — 빈 카테고리는 여기서 이미 빠져 있다. */
  sections: ChallengeSectionResult[];
  /** 한 줄이라도 아직 안 왔으면 true. 화면은 그동안 스켈레톤 하나를 그린다. */
  isLoading: boolean;
  isError: boolean;
}

/**
 * 챌린지 탭 홈의 줄 전부를 **한꺼번에** 받는다.
 *
 * 줄마다 따로 로딩을 풀면, 빈 카테고리가 하나씩 접힐 때마다 아래가 통째로
 * 밀려 올라가 카드가 아래에서 위로 스르르 올라오는 것처럼 보인다(앱이
 * 겪은 문제 — 실측 523px 이동). 전부 온 뒤에 한 번에 그리면 접히는 장면
 * 자체가 화면에 안 나온다.
 *
 * 섹션 수만큼 요청이 나가지만 limit 이 5(오늘 시작만 20)라 가볍고,
 * 각 응답은 staleTime 동안 재사용된다.
 */
export function useCategorySections(
  initialSections?: ChallengeSectionResult[]
): UseCategorySectionsResult {
  const seeded = new Map(
    initialSections?.map((entry) => [entry.section.id, entry.items])
  );

  const results = useQueries({
    queries: CHALLENGE_SECTIONS.map((section) => {
      const params = toSectionParams(section);
      const initial = seeded.get(section.id);
      return {
        queryKey: CHALLENGE_QUERY_KEYS.list(params),
        queryFn: () => challengeBoardApi.getChallengeList(params),
        ...(initial
          ? {
              // 서버가 이미 읽어 둔 줄은 로딩 없이 그대로 그리고 조용히
              // 최신화한다(0 이면 즉시 stale).
              initialData: { items: initial, pageInfo: undefined },
              initialDataUpdatedAt: 0,
            }
          : {}),
      };
    }),
  });

  // **앞에서부터 도착한 만큼만** 그린다. 중간 줄이 아직이면 거기서 멈춘다 —
  // 순서 없이 도착하는 대로 그리면, 늦게 온 앞줄이 끼어들 때 아래가 통째로
  // 밀린다(앱이 겪은 문제 — 실측 523px 이동). 이 규칙이면 화면은 아래로
  // 자라기만 하고 이미 그린 줄은 자리를 안 바꾼다.
  const sections: ChallengeSectionResult[] = [];
  for (let index = 0; index < CHALLENGE_SECTIONS.length; index += 1) {
    const result = results[index];
    const settled = result?.data !== undefined || result?.isError === true;
    if (!settled) {
      break;
    }
    const section = CHALLENGE_SECTIONS[index];
    const items = pickSectionItems(section, result?.data?.items ?? []);
    // 빈 카테고리는 줄째 안 그린다 — 빈 레일을 늘어놓으면 스크롤만
    // 길어지고 볼 것은 없다.
    if (items.length > 0) {
      sections.push({ section, items });
    }
  }

  // 그릴 것이 하나도 없고 아직 받는 중일 때만 스켈레톤이다.
  const isLoading =
    sections.length === 0 && results.some((result) => result.isPending);
  const isError = results.every((result) => result.isError);

  return { sections, isLoading, isError };
}
