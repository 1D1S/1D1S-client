import type { ChallengeCategory } from '../type/challenge';

type FilterableCategory = Exclude<ChallengeCategory, 'ALL'>;

export function toCategoryParam(
  category: ChallengeCategory
): FilterableCategory | undefined {
  return category === 'ALL' ? undefined : category;
}
