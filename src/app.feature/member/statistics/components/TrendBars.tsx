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
  /** 미니 모드: 막대 영역 높이 축소 */
  compact?: boolean;
  /** 스크린리더용 차트 설명 */
  ariaLabel?: string;
  className?: string;
}

/**
 * CSS flex 기반 막대 차트 (외부 의존성 없음).
 * 최댓값 막대를 브랜드색으로 강조하고 나머지는 soft 피치색으로 그린다.
 */
export function TrendBars({
  data,
  compact = false,
  ariaLabel,
  className,
}: TrendBarsProps): React.ReactElement {
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const areaHeight = compact ? 72 : 128;
  // 막대 위 count 라벨이 고정 높이 영역을 넘지 않도록 여백 확보.
  const labelReserve = 18;
  const barArea = Math.max(0, areaHeight - labelReserve);

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex items-end gap-1.5"
        style={{ height: areaHeight }}
        role="img"
        aria-label={ariaLabel}
      >
        {data.map((d, i) => {
          const heightPx = computeBarHeightPx(d.count, max, barArea);
          const isPeak = d.count === max && d.count > 0;
          const barColor =
            d.count === 0
              ? 'var(--gray-100)'
              : isPeak
                ? 'var(--main-700)'
                : 'var(--main-400)';
          return (
            <div
              key={`${d.bucket}-${i}`}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center',
                'justify-end'
              )}
              title={`${d.label}: ${d.count}`}
            >
              {d.count > 0 ? (
                <Text
                  size="caption5"
                  weight="bold"
                  className={cn(
                    'mb-1 block',
                    isPeak ? 'text-main-700' : 'text-gray-400'
                  )}
                >
                  {d.count}
                </Text>
              ) : null}
              <div
                className="w-full rounded-[6px] transition-[height]"
                style={{ height: heightPx, backgroundColor: barColor }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <div
            key={`${d.bucket}-label-${i}`}
            className="min-w-0 flex-1 text-center"
          >
            <Text size="caption5" className="block truncate text-gray-400">
              {d.label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
