'use client';

import { ProgressBar, Text } from '@1d1s/design-system';
import type { Feeling } from '@feature/diary/board/type/diary';
import { cn } from '@module/utils/cn';
import Image from 'next/image';
import React from 'react';

import { useFeelingStatistics } from '../hooks/useStatisticsQueries';
import {
  FEELING_COLOR,
  FEELING_FG,
  FEELING_LABEL,
  FEELING_MOOD_IMAGE,
  FEELING_ORDER,
  FEELING_SOFT_BG,
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
            const fg = FEELING_FG[feeling];
            return (
              <li
                key={feeling}
                className="flex items-center gap-3 rounded-[12px] px-4 py-2.5"
                style={{ backgroundColor: FEELING_SOFT_BG[feeling] }}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex h-[30px] w-[30px] shrink-0 items-center',
                    'justify-center rounded-full bg-white'
                  )}
                >
                  {mood ? (
                    <Image
                      src={mood.src}
                      alt=""
                      width={18}
                      height={18}
                      unoptimized
                    />
                  ) : null}
                </span>
                <Text size="caption1" weight="bold" style={{ color: fg }}>
                  {FEELING_LABEL[feeling]}
                </Text>
                <ProgressBar
                  value={Math.round(ratio * 100)}
                  size="sm"
                  showValueText={false}
                  fillColor={fg}
                  trackColor="var(--white)"
                  className="flex-1"
                  trackClassName="mt-0"
                />
                <Text size="caption1" weight="bold" style={{ color: fg }}>
                  {formatPercent(ratio)}
                </Text>
                <Text size="caption3" className="w-6 text-right text-gray-400">
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
