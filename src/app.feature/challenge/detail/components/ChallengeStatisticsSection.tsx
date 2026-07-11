'use client';

import { Text } from '@1d1s/design-system';
import { Skeleton } from '@component/Skeleton';
import { normalizeApiError } from '@module/api/error';
import { cn } from '@module/utils/cn';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import { ChallengeDiaryCalendar } from './ChallengeDiaryCalendar';

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
 * 챌린지 통계 — 참여율/완료 목표수 KPI + 날짜별 일지 캘린더.
 * 캘린더 셀 클릭 시 그 날짜로 필터된 일지 목록으로 이동한다.
 */
export function ChallengeStatisticsSection({
  challengeId,
}: ChallengeStatisticsSectionProps): React.ReactElement {
  const router = useRouter();
  const { data, isPending, isError, error } =
    useChallengeStatistics(challengeId);

  const trend = useMemo(() => data?.diaryTrend ?? [], [data]);

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
