'use client';

import { StatCard, Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import { ChallengeDiaryTrendPoint } from '../type/challengeStatistics';
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

// 날짜별 일지 추이 막대 차트. 막대 클릭 시 그 날짜로 필터된 일지 탭으로 이동.
function DiaryTrendChart({
  trend,
  onSelectDate,
}: {
  trend: ChallengeDiaryTrendPoint[];
  onSelectDate(date: string): void;
}): React.ReactElement {
  const { max, peakIndex } = useMemo(
    () => summarizeDiaryTrend(trend),
    [trend]
  );

  return (
    <div
      className="grid h-[120px] items-end gap-1 sm:h-[150px] sm:gap-1.5"
      style={{ gridTemplateColumns: `repeat(${trend.length}, 1fr)` }}
    >
      {trend.map((point, index) => {
        const isPeak = index === peakIndex;
        const hasDiary = point.count > 0;
        const heightPct = Math.max((point.count / max) * 74, hasDiary ? 10 : 3);
        return (
          <button
            key={point.date}
            type="button"
            disabled={!hasDiary}
            onClick={() => onSelectDate(point.date)}
            className={cn(
              'flex h-full flex-col items-center justify-end gap-1.5',
              hasDiary ? 'cursor-pointer' : 'cursor-default'
            )}
          >
            {hasDiary ? (
              <span
                className={cn(
                  'text-[10.5px] font-extrabold tabular-nums',
                  isPeak ? 'text-main-800' : 'text-gray-400'
                )}
              >
                {point.count}
              </span>
            ) : null}
            <span
              className={cn(
                'w-full max-w-[26px] rounded-[7px]',
                !hasDiary
                  ? 'bg-gray-100'
                  : isPeak
                    ? 'bg-main-800'
                    : 'bg-main-300'
              )}
              style={{ height: `${heightPct}%` }}
            />
            <span
              className={cn(
                'text-[9px] font-medium text-gray-400 sm:text-[9.5px]',
                '[writing-mode:vertical-rl] sm:[writing-mode:horizontal-tb]'
              )}
            >
              {formatShortDate(point.date)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * 챌린지 통계 탭 — 참여율/완료 목표수/총 일지/진행 KPI + 날짜별 일지 추이
 * 막대 차트. 막대를 누르면 그 날짜로 필터된 일지 탭으로 이동한다.
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

  const participationLabel =
    data.participationRate < 0
      ? '시작 전'
      : `${Math.round(data.participationRate * 10) / 10}%`;

  const peakPoint = summary.peakIndex >= 0 ? trend[summary.peakIndex] : null;

  return (
    <div className="flex flex-col gap-3.5 lg:gap-4">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard label="참여율" value={participationLabel} />
        <StatCard label="완료 목표수" value={`${data.completedGoalCount}개`} />
        <StatCard label="총 일지" value={`${summary.total}개`} />
        <StatCard
          label="진행"
          value={
            <span className="tabular-nums">
              {progress.currentDay}
              <span className="text-gray-400">
                {' '}
                / {progress.totalDays}일
              </span>
            </span>
          }
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
            <DiaryTrendChart
              trend={trend}
              onSelectDate={(date) =>
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
