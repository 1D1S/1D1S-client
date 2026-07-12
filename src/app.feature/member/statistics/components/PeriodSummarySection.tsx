'use client';

import {
  Button,
  Icon,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  Text,
} from '@1d1s/design-system';
import { BarTrend, type BarTrendDatum } from '@component/charts/BarTrend';
import { Skeleton } from '@component/Skeleton';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import {
  useStatisticsPeriods,
  useStatisticsSummary,
} from '../hooks/useStatisticsQueries';
import type { StatisticsPeriodUnit } from '../type/statistics';
import {
  FEELING_FG,
  FEELING_LABEL,
  FEELING_MOOD_IMAGE,
  FEELING_ORDER,
  FEELING_SOFT_BG,
  formatBucketLabel,
  formatDelta,
  formatPercent,
} from '../utils/statisticsView';
import { StatisticsCard } from './StatisticsCard';

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
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      pill
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? '이전 기간' : '다음 기간'}
      className="shrink-0"
    >
      <Icon
        name={direction === 'prev' ? 'ChevronLeft' : 'ChevronRight'}
        size={16}
        aria-hidden
      />
    </Button>
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

interface KpiTileProps {
  icon: React.ReactNode;
  /** soft 아이콘 타일 배경/글자색 유틸 클래스 */
  iconClass: string;
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: string;
  /** 보조 텍스트 강조색 유틸 클래스 */
  subClass?: string;
}

// DS StatCard 조합 — soft 아이콘 타일을 label 슬롯에 넣는다.
function KpiTile({
  icon,
  iconClass,
  label,
  value,
  unit,
  sub,
  subClass,
}: KpiTileProps): React.ReactElement {
  return (
    <StatCard
      tone="white"
      size="sm"
      className="min-w-0 shadow-none"
      label={
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              'flex h-7 w-7 items-center justify-center',
              'rounded-[9px]',
              iconClass
            )}
          >
            {icon}
          </span>
          {label}
        </span>
      }
      value={
        <>
          {value}
          {unit ? (
            <span className="ml-0.5 text-[13px] font-bold text-gray-400">
              {unit}
            </span>
          ) : null}
        </>
      }
      helper={
        sub ? (
          <span className={cn('font-bold', subClass)}>{sub}</span>
        ) : undefined
      }
    />
  );
}

// 실제 레이아웃(네비 + KPI 4종 + 하이라이트 + 칩 + 추이)과 동일한 구조의
// 스켈레톤 — 로드 완료 시 레이아웃 쉬프트가 없도록 높이를 맞춘다.
function SummarySkeleton(): React.ReactElement {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton shape="circle" className="h-[38px] w-[38px] shrink-0" />
        <Skeleton className="h-[38px] flex-1 rounded-[10px]" />
        <Skeleton shape="circle" className="h-[38px] w-[38px] shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={cn(
              'space-y-2.5 rounded-[12px] border border-gray-200',
              'p-3'
            )}
          >
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-7 w-7 rounded-[9px]" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-[12px]" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-14" />
        <div className="flex gap-1.5">
          <Skeleton shape="pill" className="h-6 w-20" />
          <Skeleton shape="pill" className="h-6 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-[90px] w-full" />
      </div>
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

  // start 기준 오름차순 정렬 → 서버 배열 순서와 무관하게 이전/다음 결정.
  const sortedPeriods = useMemo(() => {
    const list = periodsQuery.data?.periods ?? [];
    return [...list].sort((first, second) =>
      first.start.localeCompare(second.start)
    );
  }, [periodsQuery.data]);

  // periodKey 는 서버 필수 파라미터. 사용자가 특정 기간을 고르기 전에는
  // 가장 최근 기간(정렬 마지막)을 기본값으로 사용해 요청에 반드시 담는다.
  const resolvedPeriodKey =
    periodKey ?? sortedPeriods[sortedPeriods.length - 1]?.key;

  const summaryQuery = useStatisticsSummary({
    unit,
    periodKey: resolvedPeriodKey,
  });

  const summary = summaryQuery.data;

  // 실제 로드된 기간 키를 우선 사용 (없으면 기본 최근 기간).
  const activeKey = summary?.periodKey ?? resolvedPeriodKey;
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

  const subTrend: BarTrendDatum[] = (summary?.subTrend ?? []).map((point) => ({
    key: point.bucket,
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
      skeleton={<SummarySkeleton />}
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

          {/* 기간 전환 중(placeholder)에는 dim, 새 데이터가 오면
              opacity 만 부드럽게 복귀 — remount 없는 크로스페이드. */}
          <div
            className={cn(
              'space-y-5 transition-opacity duration-300 ease-out',
              summaryQuery.isPlaceholderData && 'opacity-40'
            )}
          >
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <KpiTile
                icon={<Icon name="PencilLine" size={14} aria-hidden />}
                iconClass="bg-main-200 text-main-700"
                label="작성한 일지"
                value={summary.diaryCount}
                unit="개"
                sub={`전기간 대비 ${formatDelta(summary.diaryCountDelta)}`}
                subClass="text-main-700"
              />
              <KpiTile
                icon={<Icon name="Calendar" size={14} aria-hidden />}
                iconClass="bg-blue-200 text-blue-600"
                label="활동일수"
                value={summary.activeDays}
                unit="일"
              />
              <KpiTile
                icon={<Icon name="Target" size={14} aria-hidden />}
                iconClass="bg-mint-100 text-mint-900"
                label="목표 달성률"
                value={formatPercent(summary.goalCompletionRate).replace(
                  '%',
                  ''
                )}
                unit="%"
                sub={`달성 ${summary.completedGoalCount}개`}
                subClass="text-mint-900"
              />
              <KpiTile
                icon={<Icon name="Flame" size={14} aria-hidden />}
                iconClass="bg-gray-100 text-gray-600"
                label="최장 스트릭"
                value={summary.maxStreakInPeriod}
                unit="일"
              />
            </div>

            <div
              className={cn(
                'flex items-center gap-2.5 rounded-[12px]',
                'bg-main-200 px-4 py-3'
              )}
            >
              <Icon
                name="Trophy"
                size={16}
                className="text-main-700"
                aria-hidden
              />
              <Text size="caption1" weight="bold" className="text-gray-700">
                {PEAK_LABEL[summary.unit]}
              </Text>
              <Text
                size="caption1"
                weight="bold"
                className="text-main-700 ml-auto"
              >
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
                    <span
                      key={feeling}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full',
                        'px-2.5 py-1 text-xs font-bold'
                      )}
                      style={{
                        backgroundColor: FEELING_SOFT_BG[feeling],
                        color: FEELING_FG[feeling],
                      }}
                    >
                      {mood ? (
                        <Image
                          src={mood.src}
                          alt=""
                          width={14}
                          height={14}
                          aria-hidden
                          unoptimized
                        />
                      ) : null}
                      {FEELING_LABEL[feeling]} {count}
                    </span>
                  );
                })}
              </div>
            </div>

            {subTrend.length > 0 ? (
              <div>
                <Text size="caption2" className="mb-2 block text-gray-500">
                  기간 내 추이
                </Text>
                <BarTrend
                  data={subTrend}
                  compact
                  ariaLabel="기간 내 작성 추이 막대 차트"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </StatisticsCard>
  );
}
