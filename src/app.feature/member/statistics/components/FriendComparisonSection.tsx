'use client';

import {
  Icon,
  ProgressBar,
  SegmentedControl,
  Tag,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import { useFriendComparison } from '../hooks/useStatisticsQueries';
import type { FriendComparisonPeriod } from '../type/statistics';
import { formatCount } from '../utils/statisticsView';
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
      <ProgressBar
        value={widthPct}
        size="lg"
        showValueText={false}
        fillColor={color}
        trackColor="var(--white)"
        className="flex-1"
        trackClassName="mt-0"
      />
      <Text size="caption3" weight="bold" className="w-8 text-right">
        {formatCount(value)}
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
    <div className="rounded-[14px] bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <Text size="caption1" weight="bold" className="text-gray-900">
          {label}
        </Text>
        <Text size="caption3" className="text-gray-400">
          나 {formatCount(mine)} · 친구 평균 {formatCount(average)}
        </Text>
      </div>
      <div className="mt-3 space-y-2">
        <Bar value={mine} max={max} color="var(--main-700)" caption="나" />
        <Bar
          value={average}
          max={max}
          color="var(--gray-200)"
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
  const { data, isPending, isPlaceholderData, isSuccess, isError, error } =
    useFriendComparison(period);

  const friendCount = data?.friendCount ?? 0;
  const me = data?.me;
  const average = data?.friendsAverage;
  const rank = data?.myRank;

  return (
    <StatisticsCard
      title="친구들과 나"
      subtitle="친구 평균과 나의 활동을 나란히"
      action={
        <SegmentedControl
          size="sm"
          options={PERIOD_OPTIONS}
          value={period}
          onValueChange={(v) => setPeriod(v as FriendComparisonPeriod)}
          aria-label="친구 통계 기간"
        />
      }
      isLoading={isPending}
      isError={isError}
      error={error}
      isEmpty={isSuccess && friendCount === 0}
      emptyText="친구를 추가하면 평균과 순위를 함께 볼 수 있어요."
      skeletonHeight={200}
    >
      {/* 기간 전환 중(placeholder)에는 dim, 새 데이터가 오면
          opacity 만 부드럽게 복귀 — remount 없는 크로스페이드. */}
      <div
        className={cn(
          'space-y-4 transition-opacity duration-300 ease-out',
          isPlaceholderData && 'opacity-40'
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Tag
            tone="gray"
            size="sm"
            icon={<Icon name="People" size={12} aria-hidden />}
          >
            친구 {friendCount}명
          </Tag>
          {rank && rank.outOf > 0 ? (
            <Tag
              tone="brand"
              size="sm"
              icon={<Icon name="Trophy" size={12} aria-hidden />}
            >
              일지 순위 {rank.byDiaryCount}/{rank.outOf}
            </Tag>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
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
