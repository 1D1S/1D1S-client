'use client';

import { FilterChip } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import {
  CHALLENGE_CATEGORY_FILTERS,
  type ChallengeCategoryFilter,
} from '../consts/categoryFilters';
import type { ChallengeCategory } from '../type/challenge';

interface ChallengeBoardFiltersProps {
  selected: ChallengeCategory;
  onSelect(category: ChallengeCategory): void;
}

export default function ChallengeBoardFilters({
  selected,
  onSelect,
}: ChallengeBoardFiltersProps): React.ReactElement {
  return (
    <div
      className={cn(
        'scrollbar-hide -mx-5 flex gap-1.5 overflow-x-auto px-5',
        'sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0'
      )}
    >
      {CHALLENGE_CATEGORY_FILTERS.map((filter: ChallengeCategoryFilter) => (
        <div key={filter.key} className="shrink-0 sm:shrink">
          <FilterChip
            size="md"
            active={selected === filter.key}
            onClick={() => onSelect(filter.key)}
          >
            {filter.label}
          </FilterChip>
        </div>
      ))}
    </div>
  );
}
