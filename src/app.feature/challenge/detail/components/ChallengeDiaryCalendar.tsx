'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import React, { useMemo } from 'react';

import { ChallengeDiaryTrendPoint } from '../type/challengeStatistics';
import {
  parseLocalDate,
  toHeatmapLevel,
} from '../utils/challengeStatisticsView';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// level(0~4) → 배경/텍스트. 0 은 일지 없는 날.
const LEVEL_STYLE = [
  'bg-gray-50 text-gray-400',
  'bg-main-100 text-main-800',
  'bg-main-200 text-main-900',
  'bg-main-500 text-white',
  'bg-main-800 text-white',
];

interface ChallengeDiaryCalendarProps {
  trend: ChallengeDiaryTrendPoint[];
  onSelectDate(date: string): void;
}

/**
 * 날짜별 일지 캘린더 — 주(일~토) 단위 행으로 챌린지 기간의 날짜별 일지 수를
 * 색 농도로 표시한다. 셀 클릭 시 그 날짜로 필터된 일지 목록으로 이동한다.
 */
export function ChallengeDiaryCalendar({
  trend,
  onSelectDate,
}: ChallengeDiaryCalendarProps): React.ReactElement {
  const maxCount = useMemo(
    () => trend.reduce((max, point) => Math.max(max, point.count), 0),
    [trend]
  );

  // 첫 날짜 요일만큼 앞을 비우고, 마지막 주를 7칸으로 채운다.
  const cells = useMemo<Array<ChallengeDiaryTrendPoint | null>>(() => {
    if (trend.length === 0) {
      return [];
    }
    const lead = parseLocalDate(trend[0].date).getDay();
    const filled: Array<ChallengeDiaryTrendPoint | null> = [];
    for (let i = 0; i < lead; i += 1) {
      filled.push(null);
    }
    trend.forEach((point) => filled.push(point));
    while (filled.length % 7 !== 0) {
      filled.push(null);
    }
    return filled;
  }, [trend]);

  const monthLabel = useMemo(() => {
    if (trend.length === 0) {
      return '';
    }
    const start = parseLocalDate(trend[0].date);
    const end = parseLocalDate(trend[trend.length - 1].date);
    const startMonth = start.getMonth() + 1;
    const endMonth = end.getMonth() + 1;
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.getFullYear()}.${startMonth} – ${end.getFullYear()}.${endMonth}`;
    }
    if (startMonth === endMonth) {
      return `${start.getFullYear()}년 ${startMonth}월`;
    }
    return `${start.getFullYear()}년 ${startMonth}–${endMonth}월`;
  }, [trend]);

  if (cells.length === 0) {
    return (
      <Text size="caption1" className="block text-gray-400">
        표시할 기간이 없어요.
      </Text>
    );
  }

  return (
    <div className="max-w-[380px]">
      <Text size="caption1" weight="medium" className="mb-2 block text-gray-500">
        {monthLabel}
      </Text>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday, index) => (
          <div key={weekday} className="pb-0.5 text-center">
            <Text
              size="caption2"
              weight="regular"
              className={cn(
                'text-gray-400',
                index === 0 && 'text-red-400',
                index === 6 && 'text-blue-400'
              )}
            >
              {weekday}
            </Text>
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          const day = parseLocalDate(cell.date).getDate();
          const level = toHeatmapLevel(cell.count, maxCount);
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              aria-label={`${
                formatMonthDayKR(cell.date) || cell.date
              } 일지 ${cell.count}개`}
              className={cn(
                'flex aspect-square flex-col items-center justify-center',
                'gap-0.5 rounded-[8px] transition-transform',
                'hover:scale-[1.04]',
                LEVEL_STYLE[level]
              )}
            >
              <span className="text-[11px] leading-none font-bold tabular-nums">
                {day}
              </span>
              {cell.count > 0 ? (
                <span className="text-[9px] leading-none font-semibold opacity-80">
                  {cell.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
