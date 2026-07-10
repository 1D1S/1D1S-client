'use client';

import { Text } from '@1d1s/design-system';
import type { Feeling } from '@feature/diary/board/type/diary';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import { useFeelingStatistics } from '../hooks/useStatisticsQueries';
import {
  FEELING_COLOR,
  FEELING_LABEL,
  FEELING_MOOD_IMAGE,
  FEELING_ORDER,
  formatPercent,
} from '../utils/statisticsView';
import { DonutChart, type DonutSegment } from './DonutChart';
import { StatisticsCard } from './StatisticsCard';

/**
 * 감정 분포 — 도넛 + 감정별 비율 범례.
 */
export function FeelingDistributionSection(): React.ReactElement {
  const { data, isPending, isSuccess, isError, error } =
    useFeelingStatistics();

  const total = data?.total ?? 0;
  const countByFeeling = new Map<Feeling, number>();
  const ratioByFeeling = new Map<Feeling, number>();
  (data?.distribution ?? []).forEach((item) => {
    countByFeeling.set(item.feeling, item.count);
    ratioByFeeling.set(item.feeling, item.ratio);
  });

  // count 0 버킷(특히 미선택 NONE)은 범례·도넛에서 제외 — 실제 기록된
  // 감정만 노출. 총합/비율은 0 버킷이 어차피 0 기여라 그대로 정합.
  const visibleFeelings = FEELING_ORDER.filter(
    (feeling) => (countByFeeling.get(feeling) ?? 0) > 0
  );

  const segments: DonutSegment[] = visibleFeelings.map((feeling) => ({
    key: feeling,
    value: countByFeeling.get(feeling) ?? 0,
    color: FEELING_COLOR[feeling],
    label: FEELING_LABEL[feeling],
  }));

  return (
    <StatisticsCard
      title="감정 분포"
      subtitle="일지에 기록한 감정 비율"
      isLoading={isPending}
      isError={isError}
      error={error}
      isEmpty={isSuccess && total === 0}
      emptyText="아직 기록된 감정이 없어요."
      skeletonHeight={180}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-5',
          'sm:flex-row sm:items-center sm:gap-6'
        )}
      >
        <DonutChart
          segments={segments}
          size={160}
          ariaLabel={`감정 분포 도넛 차트, 전체 ${total}건`}
          centerSlot={
            <>
              <Text size="heading2" weight="extrabold">
                {total}
              </Text>
              <Text size="caption4" className="text-gray-500">
                전체 일지
              </Text>
            </>
          }
        />

        <ul className="w-full flex-1 space-y-2.5">
          {visibleFeelings.map((feeling) => {
            const count = countByFeeling.get(feeling) ?? 0;
            const ratio =
              ratioByFeeling.get(feeling) ??
              (total > 0 ? count / total : 0);
            const mood = FEELING_MOOD_IMAGE[feeling];
            return (
              <li
                key={feeling}
                className="flex items-center gap-2.5"
              >
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: FEELING_COLOR[feeling] }}
                />
                {mood ? (
                  <Image
                    src={mood.src}
                    alt=""
                    width={18}
                    height={18}
                    aria-hidden
                    unoptimized
                  />
                ) : null}
                <Text size="caption1" className="flex-1 text-gray-700">
                  {FEELING_LABEL[feeling]}
                </Text>
                <Text
                  size="caption1"
                  weight="bold"
                  className="text-gray-900"
                >
                  {formatPercent(ratio)}
                </Text>
                <Text size="caption3" className="w-10 text-right text-gray-400">
                  {count}개
                </Text>
              </li>
            );
          })}
        </ul>
      </div>
    </StatisticsCard>
  );
}
