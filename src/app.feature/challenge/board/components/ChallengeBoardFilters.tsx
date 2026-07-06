'use client';

import { ToggleGroup, ToggleGroupItem } from '@1d1s/design-system';
import { CATEGORY_OPTIONS, CategoryIcon } from '@constants/categories';
import { cn } from '@module/utils/cn';
import React from 'react';

import type {
  ChallengeCategory,
  ChallengeStatus,
  ChallengeTypeFilter,
} from '../type/challenge';

const TYPE_OPTIONS: ReadonlyArray<{
  value: ChallengeTypeFilter | 'ALL';
  label: string;
}> = [
  { value: 'ALL', label: '전체' },
  { value: 'PUBLIC', label: '사용자 운영' },
  { value: 'OFFICIAL', label: '공식 운영' },
];

const STATUS_OPTIONS: ReadonlyArray<{
  value: ChallengeStatus;
  label: string;
}> = [
  { value: 'UPCOMING', label: '모집중' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'ENDED', label: '종료' },
];

// 선택 순서와 무관하게 항상 같은 배열이 되도록 정렬 기준으로 사용 —
// 같은 조합이면 queryKey 가 동일해 캐시가 재사용된다.
const STATUS_ORDER: readonly ChallengeStatus[] = STATUS_OPTIONS.map(
  (option) => option.value
);

// 모바일(<sm): 가로 스크롤, sm 이상: 줄바꿈.
// overflow-x-auto 는 세로 오버플로도 클리핑해 칩 그림자가 위아래로
// 잘리므로, 안쪽 py 로 그림자 공간을 확보하고 -my 로 상쇄한다.
const ROW_CLASS = cn(
  'scrollbar-hide -mx-5 -my-2 flex items-center gap-1.5',
  'overflow-x-auto px-5 py-2',
  'sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0'
);

const GROUP_LABEL_CLASS = 'shrink-0 text-[11px] font-bold text-gray-400';

interface ChallengeBoardFiltersProps {
  category: ChallengeCategory;
  onCategoryChange(category: ChallengeCategory): void;
  challengeType: ChallengeTypeFilter | 'ALL';
  onChallengeTypeChange(challengeType: ChallengeTypeFilter | 'ALL'): void;
  statuses: ChallengeStatus[];
  onStatusesChange(statuses: ChallengeStatus[]): void;
  className?: string;
}

// 챌린지 보드 필터 — 카테고리(단일) / 종류(단일) / 진행 상태(다중).
// 모바일 sticky 헤더와 데스크탑 본문 양쪽에서 재사용한다.
export function ChallengeBoardFilters({
  category,
  onCategoryChange,
  challengeType,
  onChallengeTypeChange,
  statuses,
  onStatusesChange,
  className,
}: ChallengeBoardFiltersProps): React.ReactElement {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className={ROW_CLASS}>
        <span className={GROUP_LABEL_CLASS}>카테고리</span>
        <ToggleGroup
          type="single"
          value={category}
          aria-label="카테고리"
          // 선택된 항목을 다시 누르면 '' 가 들어오므로 무시해
          // 항상 하나는 선택된 상태를 유지한다.
          onValueChange={(value) => {
            if (value) {
              onCategoryChange(value as ChallengeCategory);
            }
          }}
          className="flex shrink-0 items-center gap-1.5"
        >
          <ToggleGroupItem
            value="ALL"
            size="sm"
            shape="rounded"
            className="shrink-0"
          >
            전체
          </ToggleGroupItem>
          {CATEGORY_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              size="sm"
              shape="rounded"
              className="shrink-0"
              icon={
                <CategoryIcon category={option.value} className="h-3 w-3" />
              }
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className={ROW_CLASS}>
        <span className={GROUP_LABEL_CLASS}>종류</span>
        <ToggleGroup
          type="single"
          value={challengeType}
          aria-label="챌린지 종류"
          onValueChange={(value) => {
            if (value) {
              onChallengeTypeChange(value as ChallengeTypeFilter | 'ALL');
            }
          }}
          className="flex shrink-0 items-center gap-1.5"
        >
          {TYPE_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              size="sm"
              shape="rounded"
              className="shrink-0"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <span className="mx-1 h-4 w-px shrink-0 bg-gray-200" aria-hidden />

        <span className={GROUP_LABEL_CLASS}>상태</span>
        <ToggleGroup
          type="multiple"
          value={statuses}
          aria-label="진행 상태 (복수 선택)"
          onValueChange={(values) =>
            onStatusesChange(
              STATUS_ORDER.filter((status) => values.includes(status))
            )
          }
          className="flex shrink-0 items-center gap-1.5"
        >
          {STATUS_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              size="sm"
              shape="rounded"
              className="shrink-0"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
