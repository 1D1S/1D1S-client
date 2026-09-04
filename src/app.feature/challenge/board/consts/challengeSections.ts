import { CATEGORY_OPTIONS } from '@constants/categories';

import type { ChallengeListItem, ChallengeListParams } from '../type/challenge';

/**
 * 챌린지 탭 홈이 세우는 줄 전부. **순서가 곧 화면 순서다.**
 *
 * 예전엔 전체 챌린지 하나를 무한스크롤 그리드로 보여 줬다. 그러면 첫 화면이
 * 최신순 열 몇 장뿐이라, 어떤 종류의 챌린지가 있는지가 안 보인다. 서버가
 * `category` 와 `limit` 을 둘 다 받으므로 섹션마다 다섯 장씩 따로 받는다.
 *
 * 보상이 맨 위다 — 상품이 걸린 챌린지는 찾아 들어가는 것이 아니라 눈에
 * 띄어야 하는 것이다. 그다음이 **실제로 오늘 시작한** 챌린지다.
 */
export const SECTION_LIMIT = 5;

/**
 * '오늘 시작'을 고르려고 받아 오는 한도.
 *
 * 서버에 시작일 필터가 없다. 대신 status=ONGOING 이 시작일 내림차순이라
 * 오늘 시작한 것은 첫 장 맨 앞에 몰린다 — 한 장 받아 오늘 것만 남긴다.
 * (오늘 시작한 챌린지는 UPCOMING 이 아니라 ONGOING 이다: 시작일 <= 오늘)
 */
export const TODAY_START_FETCH_LIMIT = 20;

export type ChallengeSectionKind = 'reward' | 'todayStart' | 'category';

export interface ChallengeSection {
  /** 캐시 키와 React key 로 쓰는 고유값. */
  id: string;
  label: string;
  kind: ChallengeSectionKind;
  /** 카테고리 섹션만 가진다. '전체보기' 링크가 이 값으로 만들어진다. */
  category?: string;
}

export const CHALLENGE_SECTIONS: readonly ChallengeSection[] = [
  { id: 'reward', label: '보상 챌린지', kind: 'reward' },
  { id: 'today-start', label: '오늘 시작하는 챌린지', kind: 'todayStart' },
  ...CATEGORY_OPTIONS.map((option) => ({
    id: `category:${option.value}`,
    label: option.label,
    kind: 'category' as const,
    category: option.value,
  })),
];

/**
 * 섹션 하나의 조회 조건.
 *
 * 종료된 챌린지는 **서버에서** 거른다(status=UPCOMING,ONGOING). 다섯 장을
 * 받아 웹에서 걸러 내면 종료가 섞인 카테고리는 세 장짜리 줄이 된다.
 */
export function toSectionParams(
  section: ChallengeSection
): ChallengeListParams {
  if (section.kind === 'todayStart') {
    return { limit: TODAY_START_FETCH_LIMIT, status: ['ONGOING'] };
  }
  if (section.kind === 'reward') {
    return {
      limit: SECTION_LIMIT,
      rewardOnly: true,
      status: ['UPCOMING', 'ONGOING'],
    };
  }
  return {
    limit: SECTION_LIMIT,
    category: section.category as ChallengeListParams['category'],
    status: ['UPCOMING', 'ONGOING'],
  };
}

/** 오늘 시작한 것만. 다른 섹션은 그대로 통과시킨다. */
export function pickSectionItems(
  section: ChallengeSection,
  items: ChallengeListItem[],
  now = new Date()
): ChallengeListItem[] {
  if (section.kind !== 'todayStart') {
    return items.slice(0, SECTION_LIMIT);
  }
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return items
    .filter((item) => {
      const start = new Date(item.startDate);
      start.setHours(0, 0, 0, 0);
      return start.getTime() === today.getTime();
    })
    .slice(0, SECTION_LIMIT);
}

/** 카테고리 섹션만 '전체보기' 를 건다. 나머지는 갈 곳이 없다. */
export function sectionMoreHref(section: ChallengeSection): string | undefined {
  return section.category
    ? `/challenge/category/${section.category}`
    : undefined;
}
