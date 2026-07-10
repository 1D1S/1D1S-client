'use client';

import { SegmentedControl, Tag, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import { useFriendComparison } from '../hooks/useStatisticsQueries';
import type { FriendComparisonPeriod } from '../type/statistics';
import { StatisticsCard } from './StatisticsCard';

const PERIOD_OPTIONS = [
  { value: 'WEEK', label: '주간' },
  { value: 'MONTH', label: '월간' },
];

function Bar({
  value,
  max,
  color,
  caption,
}: {
  value: number;
  max: number;
  color: string;
  caption: string;
}): React.ReactElement {
  const widthPct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div className="flex items-center gap-2">
      <Text size="caption4" className="w-14 shrink-0 text-gray-400">
        {caption}
      </Text>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${widthPct}%`, backgroundColor: color }}
        />
      </div>
      <Text size="caption3" weight="bold" className="w-6 text-right">
        {value}
      </Text>
    </div>
  );
}

interface CompareRowProps {
  label: string;
  mine: number;
  average: number;
}

function CompareRow({
  label,
  mine,
  average,
}: CompareRowProps): React.ReactElement {
  const max = Math.max(mine, average, 1);
  return (
    <div>
      <div className="flex items-center justify-between">
        <Text size="caption1" weight="medium" className="text-gray-700">
          {label}
        </Text>
        <Text size="caption3" className="text-gray-400">
          나 {mine} · 친구 평균 {average}
        </Text>
      </div>
      <div className="mt-2 space-y-1.5">
        <Bar value={mine} max={max} color="var(--main-500)" caption="나" />
        <Bar
          value={average}
          max={max}
          color="var(--gray-300)"
          caption="친구 평균"
        />
      </div>
    </div>
  );
}

/**
 * 친구 비교 — 나 vs 친구 평균 + 순위. 개별 친구는 노출하지 않는다.
 */
export function FriendComparisonSection(): React.ReactElement {
  const [period, setPeriod] = useState<FriendComparisonPeriod>('WEEK');
  const { data, isLoading, isError, error } = useFriendComparison(period);

  const friendCount = data?.friendCount ?? 0;
  const me = data?.me;
  const average = data?.friendsAverage;
  const rank = data?.myRank;

  return (
    <StatisticsCard
      title="친구 비교"
      subtitle="친구 평균과 나의 활동 비교"
      action={
        <SegmentedControl
          size="sm"
          options={PERIOD_OPTIONS}
          value={period}
          onValueChange={(v) => setPeriod(v as FriendComparisonPeriod)}
          aria-label="친구 비교 기간"
        />
      }
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={!isLoading && !isError && friendCount === 0}
      emptyText="친구를 추가하면 평균과 순위를 비교할 수 있어요."
      skeletonHeight={200}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="gray" size="sm">
            친구 {friendCount}명
          </Tag>
          {rank && rank.outOf > 0 ? (
            <Tag tone="brand" size="sm" icon="🏆">
              일지 순위 {rank.byDiaryCount}/{rank.outOf}
            </Tag>
          ) : null}
        </div>

        <div
          className={cn(
            'space-y-4 rounded-[12px] border border-gray-100',
            'bg-gray-50 p-4'
          )}
        >
          <CompareRow
            label="작성한 일지"
            mine={me?.diaryCount ?? 0}
            average={average?.diaryCount ?? 0}
          />
          <CompareRow
            label="달성한 목표"
            mine={me?.completedGoalCount ?? 0}
            average={average?.completedGoalCount ?? 0}
          />
        </div>
      </div>
    </StatisticsCard>
  );
}
