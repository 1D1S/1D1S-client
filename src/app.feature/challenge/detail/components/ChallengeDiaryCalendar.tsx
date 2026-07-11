'use client';

import {
  ScheduleCalendar,
  type ScheduleCalendarCell,
  Text,
} from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import React, { useMemo } from 'react';

import { ChallengeDiaryTrendPoint } from '../type/challengeStatistics';
import { parseLocalDate } from '../utils/challengeStatisticsView';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface ChallengeDiaryCalendarProps {
  trend: ChallengeDiaryTrendPoint[];
  onSelectDate(date: string): void;
}

// DS ScheduleCalendar 는 셀 클릭 API 가 없어, 클릭이 필요한 날짜는 content 에
// 버튼을 넣어 상호작용을 부여한다. 빈 칸은 muted 셀로 채운다.
function toDateCell(
  point: ChallengeDiaryTrendPoint,
  onSelectDate: (date: string) => void
): ScheduleCalendarCell {
  const day = parseLocalDate(point.date).getDate();
  const label = `${formatMonthDayKR(point.date) || point.date} 일지 ${
    point.count
  }개`;
  return {
    id: point.date,
    content: (
      <button
        type="button"
        onClick={() => onSelectDate(point.date)}
        aria-label={label}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-0.5',
          'rounded-[8px] transition-colors hover:bg-gray-50',
          point.count > 0 && 'text-main-800'
        )}
      >
        <span className="text-[11px] leading-none font-medium tabular-nums">
          {day}
        </span>
        {point.count > 0 ? (
          <span
            className={cn(
              'rounded-full bg-brand-soft px-1 text-[9px] leading-none',
              'font-semibold tabular-nums text-brand'
            )}
          >
            {point.count}
          </span>
        ) : null}
      </button>
    ),
  };
}

/**
 * 날짜별 일지 캘린더 — DS ScheduleCalendar(주 단위 표) 위에 챌린지 기간의
 * 날짜별 일지 수를 표시한다. 셀 클릭 시 그 날짜로 필터된 일지 목록으로 이동한다.
 */
export function ChallengeDiaryCalendar({
  trend,
  onSelectDate,
}: ChallengeDiaryCalendarProps): React.ReactElement {
  // 첫 날짜 요일만큼 앞을 비우고, 마지막 주를 7칸으로 채운 뒤 주 단위로 자른다.
  const rows = useMemo<ScheduleCalendarCell[][]>(() => {
    if (trend.length === 0) {
      return [];
    }
    const empty: ScheduleCalendarCell = { muted: true };
    const cells: ScheduleCalendarCell[] = [];
    const lead = parseLocalDate(trend[0].date).getDay();
    for (let i = 0; i < lead; i += 1) {
      cells.push(empty);
    }
    trend.forEach((point) => cells.push(toDateCell(point, onSelectDate)));
    while (cells.length % 7 !== 0) {
      cells.push(empty);
    }
    const weeks: ScheduleCalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [trend, onSelectDate]);

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

  if (rows.length === 0) {
    return (
      <Text size="caption1" className="block text-gray-400">
        표시할 기간이 없어요.
      </Text>
    );
  }

  return (
    <div className="max-w-[420px]">
      <Text size="caption1" weight="medium" className="mb-2 block text-gray-500">
        {monthLabel}
      </Text>
      <ScheduleCalendar
        rows={rows}
        weekLabels={WEEKDAYS}
        cellMinHeight={44}
      />
    </div>
  );
}
