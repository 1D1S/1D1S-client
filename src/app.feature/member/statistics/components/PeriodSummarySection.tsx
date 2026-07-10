'use client';

import {
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  Tag,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import {
  useStatisticsPeriods,
  useStatisticsSummary,
} from '../hooks/useStatisticsQueries';
import type { StatisticsPeriodUnit } from '../type/statistics';
import {
  FEELING_LABEL,
  FEELING_MOOD_IMAGE,
  FEELING_ORDER,
  formatBucketLabel,
  formatDelta,
  formatPercent,
} from '../utils/statisticsView';
import { StatisticsCard } from './StatisticsCard';
import { TrendBars, type TrendDatum } from './TrendBars';

const UNIT_OPTIONS = [
  { value: 'WEEK', label: '주' },
  { value: 'MONTH', label: '월' },
  { value: 'YEAR', label: '연' },
];

// 가장 활발한 구간 라벨 — 연간은 "달", 그 외는 "날".
const PEAK_LABEL: Record<StatisticsPeriodUnit, string> = {
  WEEK: '가장 활발한 날',
  MONTH: '가장 활발한 날',
  YEAR: '가장 활발한 달',
};

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick(): void;
}): React.ReactElement {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? '이전 기간' : '다음 기간'}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center',
        'rounded-full border border-gray-200 bg-white text-gray-600',
        'transition-colors hover:bg-gray-50',
        'disabled:cursor-not-allowed disabled:opacity-40'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

interface PeriodNavProps {
  periods: Array<{ key: string; label: string }>;
  activeKey?: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev(): void;
  onNext(): void;
  onJump(key: string): void;
}

function PeriodNav({
  periods,
  activeKey,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onJump,
}: PeriodNavProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <NavButton direction="prev" disabled={!hasPrev} onClick={onPrev} />
      <div className="min-w-0 flex-1">
        <Select value={activeKey} onValueChange={onJump}>
          <SelectTrigger size="sm" className="w-full justify-center">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.key} value={period.key}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <NavButton direction="next" disabled={!hasNext} onClick={onNext} />
    </div>
  );
}

/**
 * 기간 요약 — 주/월/연 토글 + 이전/다음 네비 + 기간 점프 + KPI 카드.
 */
export function PeriodSummarySection(): React.ReactElement {
  const [unit, setUnit] = useState<StatisticsPeriodUnit>('WEEK');
  const [periodKey, setPeriodKey] = useState<string | undefined>(undefined);

  const periodsQuery = useStatisticsPeriods(unit);
  const summaryQuery = useStatisticsSummary({ unit, periodKey });

  const summary = summaryQuery.data;

  // start 기준 오름차순 정렬 → 서버 배열 순서와 무관하게 이전/다음 결정.
  const sortedPeriods = useMemo(() => {
    const list = periodsQuery.data?.periods ?? [];
    return [...list].sort((first, second) =>
      first.start.localeCompare(second.start)
    );
  }, [periodsQuery.data]);

  // 실제 로드된 기간 키를 우선 사용 (초기 undefined → 서버가 최신 반환).
  const activeKey = summary?.periodKey ?? periodKey;
  const activeIndex = sortedPeriods.findIndex((item) => item.key === activeKey);

  // 버튼 활성은 서버 신호(hasPrev/hasNext)와 실제 목록 내 이동 가능 여부를
  // 함께 만족할 때만. 키 포맷 불일치·로딩 레이스로 activeIndex 를 못 찾으면
  // 활성화돼도 클릭이 무의미하므로 비활성 처리한다.
  const canPrev = (summary?.hasPrev ?? false) && activeIndex > 0;
  const canNext =
    (summary?.hasNext ?? false) &&
    activeIndex >= 0 &&
    activeIndex < sortedPeriods.length - 1;

  const changeUnit = (next: StatisticsPeriodUnit): void => {
    setUnit(next);
    setPeriodKey(undefined);
  };

  const goPrev = (): void => {
    if (activeIndex > 0) {
      setPeriodKey(sortedPeriods[activeIndex - 1].key);
    }
  };
  const goNext = (): void => {
    if (activeIndex >= 0 && activeIndex < sortedPeriods.length - 1) {
      setPeriodKey(sortedPeriods[activeIndex + 1].key);
    }
  };

  const subTrend: TrendDatum[] = (summary?.subTrend ?? []).map((point) => ({
    bucket: point.bucket,
    count: point.count ?? 0,
    label: formatBucketLabel(point.bucket),
  }));

  // 로그인 확정 전(enabled: false)에는 isLoading 이 false 라서 빈상태로
  // 새는 문제가 있어, settled 전까지는 isPending 으로 스켈레톤을 유지한다.
  const isPending = summaryQuery.isPending || periodsQuery.isPending;

  return (
    <StatisticsCard
      title="기간 요약"
      subtitle="주·월·연 단위 활동 리포트"
      action={
        <SegmentedControl
          size="sm"
          options={UNIT_OPTIONS}
          value={unit}
          onValueChange={(value) => changeUnit(value as StatisticsPeriodUnit)}
          aria-label="요약 기간 단위"
        />
      }
      isLoading={isPending}
      isError={summaryQuery.isError}
      error={summaryQuery.error}
      isEmpty={summaryQuery.isSuccess && !summary}
      emptyText="아직 요약할 활동이 없어요."
      skeletonHeight={320}
    >
      {summary ? (
        <div className="space-y-5">
          <PeriodNav
            periods={sortedPeriods}
            activeKey={activeKey}
            hasPrev={canPrev}
            hasNext={canNext}
            onPrev={goPrev}
            onNext={goNext}
            onJump={setPeriodKey}
          />

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <StatCard
              label="작성한 일지"
              value={summary.diaryCount}
              helper={`전기간 대비 ${formatDelta(summary.diaryCountDelta)}`}
              tone="brand"
            />
            <StatCard label="활동일수" value={summary.activeDays} />
            <StatCard
              label="목표 달성률"
              value={formatPercent(summary.goalCompletionRate)}
              helper={`달성 ${summary.completedGoalCount}개`}
              tone="mint"
            />
            <StatCard
              label="기간 내 최장 스트릭"
              value={summary.maxStreakInPeriod}
              tone="blue"
            />
          </div>

          <div
            className={cn(
              'flex flex-wrap items-center gap-2 rounded-[12px]',
              'bg-gray-50 px-4 py-3'
            )}
          >
            <Text size="caption2" className="text-gray-500">
              {PEAK_LABEL[summary.unit]}
            </Text>
            <Text size="caption1" weight="bold" className="text-gray-900">
              {summary.peakBucket && summary.peakBucket.count > 0
                ? `${formatBucketLabel(summary.peakBucket.key)} · ` +
                  `${summary.peakBucket.count}개`
                : '없음'}
            </Text>
          </div>

          <div>
            <Text size="caption2" className="mb-2 block text-gray-500">
              감정 구성
            </Text>
            <div className="flex flex-wrap gap-1.5">
              {FEELING_ORDER.map((feeling) => {
                const count =
                  (summary.feelingBreakdown ?? []).find(
                    (entry) => entry.feeling === feeling
                  )?.count ?? 0;
                // count 0 감정(특히 미선택 NONE)은 칩에서 제외.
                if (count === 0) {
                  return null;
                }
                const mood = FEELING_MOOD_IMAGE[feeling];
                return (
                  <Tag key={feeling} tone="gray" size="sm">
                    <span className="inline-flex items-center gap-1">
                      {mood ? (
                        <Image
                          src={mood.src}
                          alt=""
                          width={16}
                          height={16}
                          aria-hidden
                          unoptimized
                        />
                      ) : null}
                      {FEELING_LABEL[feeling]} {count}
                    </span>
                  </Tag>
                );
              })}
            </div>
          </div>

          {subTrend.length > 0 ? (
            <div>
              <Text size="caption2" className="mb-2 block text-gray-500">
                기간 내 추이
              </Text>
              <TrendBars
                data={subTrend}
                compact
                ariaLabel="기간 내 작성 추이 막대 차트"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </StatisticsCard>
  );
}
