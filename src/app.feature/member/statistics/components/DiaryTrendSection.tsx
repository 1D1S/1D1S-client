'use client';

import { SegmentedControl } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import { useDiaryTrend } from '../hooks/useStatisticsQueries';
import type { DiaryTrendUnit } from '../type/statistics';
import { formatBucketLabel } from '../utils/statisticsView';
import { LineTrend, type TrendDatum } from './LineTrend';
import { StatisticsCard } from './StatisticsCard';

const UNIT_OPTIONS = [
  { value: 'DAY', label: '일' },
  { value: 'WEEK', label: '주' },
  { value: 'MONTH', label: '월' },
];

/**
 * 작성 추이 — 일/주/월 토글 + 꺾은선 차트.
 */
export function DiaryTrendSection(): React.ReactElement {
  const [unit, setUnit] = useState<DiaryTrendUnit>('DAY');
  const { data, isPending, isPlaceholderData, isSuccess, isError, error } =
    useDiaryTrend({ unit });

  const points = data?.points ?? [];
  const chartData: TrendDatum[] = points.map((p) => ({
    bucket: p.bucket,
    count: p.count ?? 0,
    label: formatBucketLabel(p.bucket),
  }));
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <StatisticsCard
      title="작성 추이"
      subtitle="기간별 일지 작성 수"
      action={
        <SegmentedControl
          size="sm"
          options={UNIT_OPTIONS}
          value={unit}
          onValueChange={(v) => setUnit(v as DiaryTrendUnit)}
          aria-label="작성 추이 단위"
        />
      }
      isLoading={isPending}
      isError={isError}
      error={error}
      isEmpty={isSuccess && (chartData.length === 0 || totalCount === 0)}
      emptyText="이 기간에 작성한 일지가 없어요."
      skeletonHeight={160}
    >
      {/* 단위 전환 중(placeholder)에는 dim, 새 데이터가 오면
          opacity 만 부드럽게 복귀 — remount 없는 크로스페이드. */}
      <div
        className={cn(
          'transition-opacity duration-300 ease-out',
          isPlaceholderData && 'opacity-40'
        )}
      >
        <LineTrend
          data={chartData}
          ariaLabel={`작성 추이 꺾은선 차트, 총 ${totalCount}건`}
        />
      </div>
    </StatisticsCard>
  );
}
