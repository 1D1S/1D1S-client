import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import { computeBarHeightPx } from '../utils/statisticsView';

export interface TrendDatum {
  bucket: string;
  count: number;
  label: string;
}

interface TrendBarsProps {
  data: TrendDatum[];
  /** 막대 색 (CSS color) */
  color?: string;
  /** 미니 모드: 라벨/값 숨김, 높이 축소 */
  compact?: boolean;
  /** 스크린리더용 차트 설명 */
  ariaLabel?: string;
  className?: string;
}

/**
 * CSS flex 기반 막대 차트 (외부 의존성 없음).
 * 각 bucket 을 최대값 기준 비율 높이 막대로 그린다.
 */
export function TrendBars({
  data,
  color = 'var(--main-500)',
  compact = false,
  ariaLabel,
  className,
}: TrendBarsProps): React.ReactElement {
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const areaHeight = compact ? 56 : 128;
  // 최댓값 막대 위 count 라벨이 고정 높이 영역을 넘지 않도록 여백 확보.
  const labelReserve = compact ? 0 : 18;
  const barArea = Math.max(0, areaHeight - labelReserve);

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex items-end gap-1"
        style={{ height: areaHeight }}
        role="img"
        aria-label={ariaLabel}
      >
        {data.map((d, i) => {
          const heightPx = computeBarHeightPx(d.count, max, barArea);
          return (
            <div
              key={`${d.bucket}-${i}`}
              className="flex min-w-0 flex-1 flex-col items-center justify-end"
              title={`${d.label}: ${d.count}`}
            >
              {!compact && d.count > 0 ? (
                <Text
                  size="caption5"
                  className="mb-1 block text-gray-500"
                >
                  {d.count}
                </Text>
              ) : null}
              <div
                className="w-full rounded-[3px] transition-[height]"
                style={{
                  height: heightPx,
                  backgroundColor: d.count > 0 ? color : 'var(--gray-200)',
                }}
              />
            </div>
          );
        })}
      </div>

      {!compact ? (
        <div className="mt-2 flex gap-1">
          {data.map((d, i) => (
            <div
              key={`${d.bucket}-label-${i}`}
              className="min-w-0 flex-1 text-center"
            >
              <Text
                size="caption5"
                className="block truncate text-gray-400"
              >
                {d.label}
              </Text>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
