'use client';

import { Tag, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { formatMonthDayKR } from '@module/utils/date';
import { CalendarDays, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useChallengeStatistics } from '../hooks/useChallengeDiaryQueries';
import { ChallengeDiaryCalendar } from './ChallengeDiaryCalendar';

interface ChallengeDiaryDateFilterProps {
  challengeId: number;
  // 현재 활성 날짜 필터 (YYYY-MM-DD). 없으면 전체.
  activeDate?: string;
  onSelectDate(date: string): void;
  onClear(): void;
}

/**
 * 일지 탭 날짜 필터 — 캘린더에서 넘어온 date 를 탭 안에서 확인·해제·변경한다.
 * 선택된 날짜 칩 + 해제 버튼과, 접었다 펼치는 날짜 선택 캘린더로 구성한다.
 * 날짜 변경은 부모가 URL(?tab=diary&date=)에 replace 로 동기화한다.
 */
export function ChallengeDiaryDateFilter({
  challengeId,
  activeDate,
  onSelectDate,
  onClear,
}: ChallengeDiaryDateFilterProps): React.ReactElement | null {
  const { data } = useChallengeStatistics(challengeId);
  const trend = useMemo(() => data?.diaryTrend ?? [], [data]);
  const validDate =
    activeDate && /^\d{4}-\d{2}-\d{2}$/.test(activeDate)
      ? activeDate
      : undefined;
  const [open, setOpen] = useState(false);

  // 표시할 기간이 없으면(통계 미도착 등) 필터 UI 를 렌더하지 않는다.
  if (trend.length === 0 && !validDate) {
    return null;
  }

  const filterLabel = validDate ? formatMonthDayKR(validDate) : '';
  const hasCalendar = trend.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {validDate ? (
          <>
            <Tag tone="brand" size="sm">
              {filterLabel} 일지만 보기
            </Tag>
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border',
                'border-gray-200 px-2.5 py-1 text-[12px] text-gray-600',
                'transition hover:bg-gray-50'
              )}
            >
              <X className="h-3.5 w-3.5" />
              필터 해제
            </button>
          </>
        ) : (
          <Text size="caption1" weight="medium" className="text-gray-500">
            전체 일지
          </Text>
        )}

        {hasCalendar ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className={cn(
              'ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
              'text-[12px] font-semibold transition',
              open
                ? 'border-main-300 bg-main-100 text-main-800'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {validDate ? '날짜 변경' : '날짜 선택'}
          </button>
        ) : null}
      </div>

      {open && hasCalendar ? (
        <div className="rounded-[14px] border border-gray-200 bg-white p-3 sm:p-4">
          <ChallengeDiaryCalendar
            trend={trend}
            selectedDate={validDate}
            onSelectDate={(date) => {
              onSelectDate(date);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
