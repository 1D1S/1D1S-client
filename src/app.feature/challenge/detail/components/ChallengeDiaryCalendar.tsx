'use client';

import {
  MonthCalendar,
  type MonthCalendarDay,
  Text,
} from '@1d1s/design-system';
import { formatDateISO } from '@module/utils/date';
import React, { useMemo } from 'react';

import { ChallengeDiaryTrendPoint } from '../type/challengeStatistics';
import { parseLocalDate } from '../utils/challengeStatisticsView';

interface ChallengeDiaryCalendarProps {
  trend: ChallengeDiaryTrendPoint[];
  onSelectDate(date: string): void;
  // 선택된 날짜(YYYY-MM-DD). 지정 시 해당 셀을 강조한다.
  selectedDate?: string;
}

/**
 * 날짜별 일지 캘린더 — DS MonthCalendar 로 챌린지 기간의 날짜별 일지 수를
 * 표시한다. 날짜 클릭 시 그 날짜로 필터된 일지 목록으로 이동하고, 월 이동으로
 * 챌린지 기간 내 다른 달도 볼 수 있다. 기간(첫~마지막 날) 밖 날짜는 비활성.
 */
export function ChallengeDiaryCalendar({
  trend,
  onSelectDate,
  selectedDate,
}: ChallengeDiaryCalendarProps): React.ReactElement {
  const days = useMemo<MonthCalendarDay[]>(
    () => trend.map((point) => ({ date: point.date, count: point.count })),
    [trend]
  );

  // 기본 표시 월: 오늘이 챌린지 기간 안이면 이번 달, 아니면 가장 가까운 경계 달.
  const defaultMonth = useMemo(() => {
    if (trend.length === 0) {
      return undefined;
    }
    const min = trend[0].date;
    const max = trend[trend.length - 1].date;
    const today = formatDateISO(new Date());
    const anchor = today < min ? min : today > max ? max : today;
    return parseLocalDate(anchor);
  }, [trend]);

  if (trend.length === 0) {
    return (
      <Text size="caption1" className="block text-gray-400">
        표시할 기간이 없어요.
      </Text>
    );
  }

  return (
    <MonthCalendar
      days={days}
      indicator="count"
      minDate={trend[0].date}
      maxDate={trend[trend.length - 1].date}
      defaultMonth={defaultMonth}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
    />
  );
}
