'use client';

import { Text } from '@1d1s/design-system';
import { BarTrend, type BarTrendDatum } from '@component/charts/BarTrend';
import { Skeleton } from '@component/Skeleton';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import {
  CalendarClock,
  FileText,
  type LucideIcon,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import {
  getTrendProgress,
  summarizeDiaryTrend,
} from '../utils/challengeStatisticsView';

interface ChallengeStatisticsSectionProps {
  challengeId: number;
}

// 'YYYY-MM-DD' → 'M/D' (막대 라벨용 컴팩트 표기).
function formatShortDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
}

// KPI 카드 — 아이콘 칩 + 라벨 + 큰 숫자. 그림자 없이 테두리만.
function Kpi({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  unit?: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-[12px] border border-gray-200',
        'bg-white p-4'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'bg-main-200 flex size-7 items-center justify-center',
            'rounded-[8px]'
          )}
        >
          <Icon className="text-main-800 size-3.5" strokeWidth={2} aria-hidden />
        </span>
        <Text size="caption2" weight="bold" className="text-gray-500">
          {label}
        </Text>
      </div>
      <div className="flex items-baseline gap-0.5">
        <Text
          size="heading1"
          weight="extrabold"
          className="text-gray-900 tabular-nums"
        >
          {value}
        </Text>
        {unit ? (
          <Text size="caption1" weight="bold" className="text-gray-400">
            {unit}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 챌린지 통계 탭 — 참여율(원형)·완료 목표수·총 일지·진행 KPI + 날짜별
 * 일지 추이 막대 차트. 막대를 누르면 그 날짜로 필터된 일지 탭으로 이동한다.
 */
export function ChallengeStatisticsSection({
  challengeId,
}: ChallengeStatisticsSectionProps): React.ReactElement {
  const router = useRouter();
  const { data, isPending, isError, error } =
    useChallengeStatistics(challengeId);

  const trend = useMemo(() => data?.diaryTrend ?? [], [data]);
  const summary = useMemo(() => summarizeDiaryTrend(trend), [trend]);
  const progress = useMemo(() => getTrendProgress(trend), [trend]);

  const barData = useMemo<BarTrendDatum[]>(
    () =>
      trend.map((point) => ({
        key: point.date,
        label: formatShortDate(point.date),
        count: point.count,
      })),
    [trend]
  );

  if (isPending) {
    return <Skeleton style={{ height: 320 }} className="w-full" />;
  }

  if (isError) {
    return (
      <div
        className={cn(
          'flex min-h-[160px] items-center justify-center rounded-[14px]',
          'border border-gray-200 bg-gray-50 px-4 py-8 text-center'
        )}
      >
        <Text size="caption1" className="text-red-500">
          {normalizeApiError(error).message}
        </Text>
      </div>
    );
  }

  const participationRate =
    data.participationRate < 0
      ? -1
      : Math.round(data.participationRate * 10) / 10;

  const peakPoint = summary.peakIndex >= 0 ? trend[summary.peakIndex] : null;

  return (
    <div className="flex flex-col gap-3.5 lg:gap-4">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi
          icon={Users}
          label="참여율"
          value={participationRate < 0 ? '시작 전' : participationRate}
          unit={participationRate < 0 ? undefined : '%'}
        />
        <Kpi
          icon={Target}
          label="완료 목표수"
          value={data.completedGoalCount}
          unit="개"
        />
        <Kpi icon={FileText} label="총 일지" value={summary.total} unit="개" />
        <Kpi
          icon={CalendarClock}
          label="진행"
          value={progress.currentDay}
          unit={`/ ${progress.totalDays}일`}
        />
      </div>

      <section
        className={cn(
          'rounded-[14px] border border-gray-200 bg-white',
          'p-4 sm:p-5 lg:p-6'
        )}
      >
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <Text
            as="h2"
            size="heading2"
            weight="extrabold"
            className="tracking-[-0.3px] text-gray-900"
          >
            날짜별 일지 추이
          </Text>
          <Text size="caption1" weight="bold" className="text-gray-400">
            총 {summary.total}개
          </Text>
        </div>

        {trend.length === 0 ? (
          <Text size="caption1" className="block text-gray-400">
            표시할 기간이 없어요.
          </Text>
        ) : (
          <>
            {peakPoint ? (
              <div className="mb-4">
                <span
                  className={cn(
                    'bg-main-100 text-main-800 inline-flex items-center',
                    'gap-1.5 rounded-full px-2.5 py-1.5',
                    'text-[11.5px] font-extrabold'
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.2} />
                  가장 활발한 날 {formatShortDate(peakPoint.date)} ·{' '}
                  {peakPoint.count}개
                </span>
              </div>
            ) : null}
            <BarTrend
              data={barData}
              ariaLabel={`날짜별 일지 추이, 총 ${summary.total}개`}
              onSelectBar={(date) =>
                // 탭/필터 변경은 history 를 오염시키지 않도록 replace 로 처리.
                router.replace(
                  `/challenge/${challengeId}?tab=diary&date=${date}`,
                  { scroll: false }
                )
              }
            />
          </>
        )}
      </section>
    </div>
  );
}
