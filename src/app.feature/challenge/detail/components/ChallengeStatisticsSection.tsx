'use client';

import { Heatmap, Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { LineTrend, type TrendDatum } from '@feature/member/statistics/components/LineTrend';
import { formatBucketLabel } from '@feature/member/statistics/utils/statisticsView';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import { toHeatmapLevel } from '../utils/challengeStatisticsView';

interface ChallengeStatisticsSectionProps {
  challengeId: number;
}

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
 * 챌린지 통계 — 참여율/완료 목표수 KPI + 일자별 일지 추이(꺾은선) +
 * 날짜별 일지 개수 히트맵 캘린더. 셀 클릭 시 그 날짜로 필터된 일지 목록으로
 * 이동한다.
 */
export function ChallengeStatisticsSection({
  challengeId,
}: ChallengeStatisticsSectionProps): React.ReactElement {
  const router = useRouter();
  const { data, isPending, isError, error } =
    useChallengeStatistics(challengeId);

  const trend = useMemo(() => data?.diaryTrend ?? [], [data]);
  const maxCount = useMemo(
    () => trend.reduce((max, point) => Math.max(max, point.count), 0),
    [trend]
  );
  const barData: TrendDatum[] = useMemo(
    () =>
      trend.map((point) => ({
        bucket: point.date,
        count: point.count ?? 0,
        label: formatBucketLabel(point.date),
      })),
    [trend]
  );
  const cells = useMemo(
    () => trend.map((point) => toHeatmapLevel(point.count, maxCount)),
    [trend, maxCount]
  );
  // Heatmap 은 컬럼 우선(7행) — 한 컬럼이 연속 7일. 컬럼 수만 계산해 전달.
  const cols = Math.max(1, Math.ceil(trend.length / 7));
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
            <Text
              size="caption1"
              weight="bold"
              className="mb-2 block text-gray-500"
            >
              일자별 일지 추이
            </Text>
            {barData.length > 0 && totalDiaries > 0 ? (
              <LineTrend
                data={barData}
                ariaLabel={`일자별 일지 추이 꺾은선 차트, 총 ${totalDiaries}건`}
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
            {cells.length > 0 ? (
              <div className="overflow-x-auto">
                <Heatmap
                  cells={cells}
                  cols={cols}
                  tone="main"
                  ariaLabel={(index) => {
                    const point = trend[index];
                    if (!point) {
                      return '';
                    }
                    const label = formatMonthDayKR(point.date) || point.date;
                    return point.count > 0
                      ? `${label} · 일지 ${point.count}개`
                      : `${label} · 일지 없음`;
                  }}
                  renderCellTooltip={({ index }) => {
                    const point = trend[index];
                    if (!point) {
                      return null;
                    }
                    const label = formatMonthDayKR(point.date) || point.date;
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{label}</span>
                        <span className="text-gray-200">
                          {point.count > 0
                            ? `일지 ${point.count}개`
                            : '일지 없음'}
                        </span>
                      </div>
                    );
                  }}
                  onCellClick={({ index }) => {
                    const point = trend[index];
                    if (point) {
                      router.push(
                        `/challenge/${challengeId}/diary?date=${point.date}`
                      );
                    }
                  }}
                />
              </div>
            ) : (
              <Text size="caption1" className="block text-gray-400">
                표시할 기간이 없어요.
              </Text>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
