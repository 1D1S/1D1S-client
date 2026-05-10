import type { ChallengeCategory } from '../type/challenge';

type FilterableCategory = Exclude<ChallengeCategory, 'ALL'>;

export interface ChallengeCategoryFilter {
  key: ChallengeCategory;
  label: string;
}

export const CHALLENGE_CATEGORY_FILTERS: ChallengeCategoryFilter[] = [
  { key: 'ALL', label: '전체' },
  { key: 'EXERCISE', label: '운동' },
  { key: 'BOOK', label: '독서' },
  { key: 'STUDY', label: '공부' },
  { key: 'DEV', label: '개발' },
  { key: 'MUSIC', label: '음악' },
  { key: 'LEISURE', label: '여가' },
  { key: 'ECONOMY', label: '경제' },
];

export function toCategoryParam(
  category: ChallengeCategory
): FilterableCategory | undefined {
  return category === 'ALL' ? undefined : category;
}
