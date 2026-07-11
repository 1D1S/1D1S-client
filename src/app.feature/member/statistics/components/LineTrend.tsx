import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

import { computeTrendPoints } from '../utils/statisticsView';

export interface TrendDatum {
  bucket: string;
  count: number;
  label: string;
}

interface LineTrendProps {
  data: TrendDatum[];
  /** 미니 모드: 차트 높이 축소 + 값 라벨 생략 */
  compact?: boolean;
  /** 스크린리더용 차트 설명 */
  ariaLabel?: string;
  className?: string;
}

// 점 지름(px) — compact 은 한 단계 작게.
function dotSize(kind: 'peak' | 'value' | 'zero', compact: boolean): number {
  if (kind === 'zero') {
    return compact ? 4 : 5;
  }
  if (kind === 'peak') {
    return compact ? 7 : 9;
  }
  return compact ? 5 : 7;
}

/**
 * 순수 SVG 꺾은선 차트 (외부 의존성 없음).
 * 선은 preserveAspectRatio="none" SVG 로 폭에 맞춰 늘이고, 점/값 라벨은
 * 같은 % 좌표를 쓰는 HTML 오버레이로 그려 비균등 스케일에도 원형을 유지한다.
 */
export function LineTrend({
  data,
  compact = false,
  ariaLabel,
  className,
}: LineTrendProps): React.ReactElement {
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const areaHeight = compact ? 72 : 128;
  const points = computeTrendPoints(
    data.map((d) => d.count),
    max
  );
  // 첫 최댓값 인덱스 — 값 라벨/강조 점 대상.
  const peakIndex = max > 0 ? data.findIndex((d) => d.count === max) : -1;

  const polyline = points.map((p) => `${p.xPct},${p.yPct}`).join(' ');

  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative w-full"
        style={{ height: areaHeight }}
        role="img"
        aria-label={ariaLabel}
      >
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {points.length > 1 ? (
            <polyline
              points={polyline}
              fill="none"
              stroke="var(--main-500)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>

        {points.map((p, i) => {
          const d = data[i];
          const isPeak = i === peakIndex;
          const kind = d.count === 0 ? 'zero' : isPeak ? 'peak' : 'value';
          const size = dotSize(kind, compact);
          const bg =
            kind === 'zero'
              ? 'var(--gray-200)'
              : kind === 'peak'
                ? 'var(--main-700)'
                : 'var(--main-500)';
          return (
            <React.Fragment key={`${d.bucket}-${i}`}>
              {!compact && isPeak ? (
                <Text
                  size="caption5"
                  weight="bold"
                  className="text-main-700 absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${p.xPct}%`, top: `calc(${p.yPct}% - 8px)` }}
                >
                  {d.count}
                </Text>
              ) : null}
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${p.xPct}%`,
                  top: `${p.yPct}%`,
                  width: size,
                  height: size,
                  backgroundColor: bg,
                  boxShadow:
                    kind === 'zero' ? undefined : '0 0 0 2px var(--white)',
                }}
                title={`${d.label}: ${d.count}`}
              />
            </React.Fragment>
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
