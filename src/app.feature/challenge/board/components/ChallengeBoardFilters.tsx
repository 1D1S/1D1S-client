'use client';

import { FilterChip } from '@1d1s/design-system';
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
    <div className="flex flex-wrap gap-1.5">
      {CHALLENGE_CATEGORY_FILTERS.map((filter: ChallengeCategoryFilter) => (
        <FilterChip
          key={filter.key}
          size="md"
          active={selected === filter.key}
          onClick={() => onSelect(filter.key)}
        >
          {filter.label}
        </FilterChip>
      ))}
    </div>
  );
}
