'use client';

import { Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { LineTrend, type TrendDatum } from '@feature/member/statistics/components/LineTrend';
import {
  formatBucketLabel,
  toIsoWeekKey,
} from '@feature/member/statistics/utils/statisticsView';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import { parseLocalDate } from '../utils/challengeStatisticsView';
import { ChallengeDiaryCalendar } from './ChallengeDiaryCalendar';

interface ChallengeStatisticsSectionProps {
  challengeId: number;
}

type TrendUnit = 'day' | 'week';

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-1 rounded-[12px] bg-gray-50 px-4 py-3">
      <Text size="caption1" weight="regular" className="text-gray-500">
        {label}
      </Text>
      <Text size="heading2" weight="bold" className="text-gray-900">
        {value}
      </Text>
    </div>
  );
}

/**
 * 챌린지 통계 — 참여율/완료 목표수 KPI + 일자별 일지 추이(꺾은선, 일/주 전환) +
 * 날짜별 일지 캘린더. 캘린더 셀 클릭 시 그 날짜로 필터된 일지 목록으로 이동한다.
 */
export function ChallengeStatisticsSection({
  challengeId,
}: ChallengeStatisticsSectionProps): React.ReactElement {
  const router = useRouter();
  const { data, isPending, isError, error } =
    useChallengeStatistics(challengeId);
  const [trendUnit, setTrendUnit] = useState<TrendUnit>('day');

  const trend = useMemo(() => data?.diaryTrend ?? [], [data]);

  // 일간: 날짜별 그대로.
  const dailyData: TrendDatum[] = useMemo(
    () =>
      trend.map((point) => ({
        bucket: point.date,
        count: point.count ?? 0,
        label: formatBucketLabel(point.date),
      })),
    [trend]
  );

  // 주간: ISO 주차로 합산. 첫 등장 순서(=시간순)를 유지한다.
  const weeklyData: TrendDatum[] = useMemo(() => {
    const sums = new Map<string, number>();
    const order: string[] = [];
    trend.forEach((point) => {
      const key = toIsoWeekKey(parseLocalDate(point.date));
      if (!sums.has(key)) {
        order.push(key);
      }
      sums.set(key, (sums.get(key) ?? 0) + (point.count ?? 0));
    });
    return order.map((key) => ({
      bucket: key,
      count: sums.get(key) ?? 0,
      label: formatBucketLabel(key),
    }));
  }, [trend]);

  const trendData = trendUnit === 'week' ? weeklyData : dailyData;
  const totalDiaries = useMemo(
    () => trend.reduce((sum, point) => sum + (point.count ?? 0), 0),
    [trend]
  );

  const participationLabel = !data
    ? '-'
    : data.participationRate < 0
      ? '시작 전'
      : `${Math.round(data.participationRate * 10) / 10}%`;

  return (
    <section
      className={cn(
        'rounded-[14px] border border-gray-200 bg-white',
        'p-4 sm:p-5 lg:p-6'
      )}
    >
      <Text
        as="h2"
        size="heading2"
        weight="extrabold"
        className="mb-3 block tracking-[-0.3px] text-gray-900"
      >
        챌린지 통계
      </Text>

      {isPending ? (
        <Skeleton style={{ height: 220 }} className="w-full" />
      ) : isError ? (
        <div
          className={cn(
            'flex min-h-[120px] items-center justify-center rounded-[12px]',
            'bg-gray-50 px-4 py-8 text-center'
          )}
        >
          <Text size="caption1" className="text-red-500">
            {normalizeApiError(error).message}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="참여율" value={participationLabel} />
            <StatTile
              label="완료 목표수"
              value={`${data.completedGoalCount}개`}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Text size="caption1" weight="bold" className="text-gray-500">
                일자별 일지 추이
              </Text>
              <div className="flex gap-0.5 rounded-full bg-gray-100 p-0.5">
                {(['day', 'week'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    aria-pressed={trendUnit === unit}
                    onClick={() => setTrendUnit(unit)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-bold',
                      'transition-colors',
                      trendUnit === unit
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {unit === 'day' ? '일간' : '주간'}
                  </button>
                ))}
              </div>
            </div>
            {trendData.length > 0 && totalDiaries > 0 ? (
              <LineTrend
                data={trendData}
                ariaLabel={`${
                  trendUnit === 'week' ? '주간' : '일자별'
                } 일지 추이 꺾은선 차트, 총 ${totalDiaries}건`}
              />
            ) : (
              <Text size="caption1" className="block text-gray-400">
                아직 작성된 일지가 없어요.
              </Text>
            )}
          </div>

          <div>
            <Text
              size="caption1"
              weight="bold"
              className="mb-2 block text-gray-500"
            >
              날짜별 일지 (날짜를 눌러 그 날 일지만 보기)
            </Text>
            <ChallengeDiaryCalendar
              trend={trend}
              onSelectDate={(date) =>
                router.push(`/challenge/${challengeId}?tab=diary&date=${date}`)
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}
