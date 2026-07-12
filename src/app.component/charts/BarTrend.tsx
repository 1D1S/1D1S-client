'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface BarTrendDatum {
  key: string;
  label: string;
  count: number;
}

export interface TrendWindow {
  start: number;
  end: number;
  pageCount: number;
  offset: number; // 0 = 최신 페이지
  hasOlder: boolean;
  hasNewer: boolean;
}

/**
 * 끝(최신)에서부터 pageSize 개씩 끊어 표시할 범위를 계산한다.
 * offset 0 이 최신 페이지이므로 데이터 길이가 바뀌어도 기준이 흔들리지 않는다.
 * 가장 오래된 페이지만 pageSize 미만일 수 있다.
 */
export function getTrendWindow(
  total: number,
  pageSize: number,
  endOffset: number
): TrendWindow {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const offset = Math.min(Math.max(endOffset, 0), pageCount - 1);
  const end = total - offset * pageSize;
  const start = Math.max(0, end - pageSize);
  return {
    start,
    end,
    pageCount,
    offset,
    hasOlder: start > 0,
    hasNewer: offset > 0,
  };
}

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick(): void;
}): React.ReactElement {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? '이전 기간' : '다음 기간'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-7 items-center justify-center rounded-full',
        'text-gray-600 transition-colors hover:bg-gray-100',
        'disabled:cursor-not-allowed disabled:text-gray-300',
        'disabled:hover:bg-transparent'
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

interface BarTrendProps {
  data: BarTrendDatum[];
  /** 한 페이지에 보여줄 막대 수. 초과하면 좌·우 버튼으로 페이징. 기본 7. */
  pageSize?: number;
  /** 미니 모드 — 높이 축소 + 라벨 가로 유지 */
  compact?: boolean;
  /** 막대 클릭 콜백 — 값이 있는 막대만 클릭 가능 */
  onSelectBar?(key: string): void;
  ariaLabel?: string;
  className?: string;
}

/**
 * 막대 추이 차트 — 외부 의존성 없음. 최신 구간부터 pageSize(기본 7)개씩
 * 끊어 보여주고 좌·우 버튼으로 이동한다. 각 페이지에서 가장 큰 막대를 강조한다.
 */
export function BarTrend({
  data,
  pageSize = 7,
  compact = false,
  onSelectBar,
  ariaLabel,
  className,
}: BarTrendProps): React.ReactElement | null {
  const [offset, setOffset] = useState(0);

  const view = getTrendWindow(data.length, pageSize, offset);
  const visible = data.slice(view.start, view.end);

  // 막대 높이 스케일 기준은 전체 최댓값 — 페이지 간 높이를 비교 가능하게.
  const maxCount = useMemo(
    () => data.reduce((acc, datum) => Math.max(acc, datum.count), 1),
    [data]
  );

  // 현재 페이지에서 최댓값 막대의 인덱스 — 강조 대상.
  const peakIndex = useMemo(() => {
    let idx = -1;
    visible.forEach((datum, index) => {
      if (datum.count > 0 && (idx < 0 || datum.count > visible[idx].count)) {
        idx = index;
      }
    });
    return idx;
  }, [visible]);

  if (data.length === 0) {
    return null;
  }

  const paged = view.pageCount > 1;
  const areaClass = compact ? 'h-[96px]' : 'h-[120px] sm:h-[150px]';

  return (
    <div className={cn('w-full', className)} aria-label={ariaLabel}>
      <div
        className={cn('grid items-end gap-1 sm:gap-1.5', areaClass)}
        style={{ gridTemplateColumns: `repeat(${visible.length}, 1fr)` }}
      >
        {visible.map((datum, index) => {
          const isPeak = index === peakIndex;
          const hasValue = datum.count > 0;
          const heightPct = hasValue
            ? Math.max((datum.count / maxCount) * 74, 10)
            : 3;
          const clickable = Boolean(onSelectBar) && hasValue;
          return (
            <button
              key={datum.key}
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onSelectBar?.(datum.key) : undefined}
              aria-label={`${datum.label} ${datum.count}개`}
              className={cn(
                'flex h-full flex-col items-center justify-end gap-1.5',
                clickable ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              {hasValue ? (
                <span
                  className={cn(
                    'text-[10.5px] font-extrabold tabular-nums',
                    isPeak ? 'text-main-800' : 'text-gray-400'
                  )}
                >
                  {datum.count}
                </span>
              ) : null}
              <span
                className={cn(
                  'w-full rounded-[7px]',
                  !hasValue
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
                  compact
                    ? ''
                    : '[writing-mode:vertical-rl] sm:[writing-mode:horizontal-tb]'
                )}
              >
                {datum.label}
              </span>
            </button>
          );
        })}
      </div>

      {paged ? (
        <div className="mt-3 flex items-center justify-center gap-3">
          <NavButton
            direction="prev"
            disabled={!view.hasOlder}
            onClick={() => setOffset((prev) => prev + 1)}
          />
          <Text
            size="caption2"
            weight="bold"
            className="text-gray-400 tabular-nums"
          >
            {view.pageCount - view.offset} / {view.pageCount}
          </Text>
          <NavButton
            direction="next"
            disabled={!view.hasNewer}
            onClick={() => setOffset((prev) => prev - 1)}
          />
        </div>
      ) : null}
    </div>
  );
}
