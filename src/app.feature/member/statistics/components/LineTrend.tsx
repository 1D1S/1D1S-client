'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useState } from 'react';

import {
  computeTrendPoints,
  findCurrentBucketIndex,
} from '../utils/statisticsView';

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

// 점 지름(px) — compact 은 한 단계 작게. 'current' 는 오늘/호버 강조점.
function dotSize(
  kind: 'current' | 'value' | 'zero',
  compact: boolean
): number {
  if (kind === 'zero') {
    return compact ? 4 : 5;
  }
  if (kind === 'current') {
    return compact ? 7 : 9;
  }
  return compact ? 5 : 7;
}

/**
 * 순수 SVG 꺾은선 차트 (외부 의존성 없음).
 * 선은 preserveAspectRatio="none" SVG 로 폭에 맞춰 늘이고, 점/값 라벨은
 * 같은 % 좌표를 쓰는 HTML 오버레이로 그려 비균등 스케일에도 원형을 유지한다.
 * 오늘(현재 구간)이 포함된 버킷을 상시 강조하고, 각 점은 호버/포커스/터치 시
 * 툴팁(날짜·기간 + 작성 수)을 띄운다.
 */
export function LineTrend({
  data,
  compact = false,
  ariaLabel,
  className,
}: LineTrendProps): React.ReactElement {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = data.reduce((acc, datum) => Math.max(acc, datum.count), 0);
  const areaHeight = compact ? 72 : 128;
  const points = computeTrendPoints(
    data.map((datum) => datum.count),
    max
  );
  // 오늘이 속한 버킷 — 강조 대상. 과거 기간을 보고 있으면 -1(강조 없음).
  const currentIndex = findCurrentBucketIndex(
    data.map((datum) => datum.bucket),
    new Date()
  );

  const polyline = points.map((point) => `${point.xPct},${point.yPct}`).join(' ');

  // 점 위에서 커서/포커스가 벗어날 때, 내가 켠 호버만 끈다(다른 점 진입 레이스 방지).
  const clearHover = (index: number): void =>
    setHoverIndex((current) => (current === index ? null : current));

  return (
    // 좌우 px 인셋 — 끝점(0%/100%) 점·라벨의 절반이 밖으로 잘리지 않게
    // 선 영역과 라벨 영역에 동일하게 적용한다.
    <div className={cn('w-full px-3', className)}>
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

        {points.map((point, index) => {
          const datum = data[index];
          const isCurrent = index === currentIndex;
          const isHover = index === hoverIndex;
          const emphasized = isCurrent || isHover;
          const kind = emphasized
            ? 'current'
            : datum.count === 0
              ? 'zero'
              : 'value';
          const size = dotSize(kind, compact);
          const bg =
            kind === 'zero'
              ? 'var(--gray-200)'
              : kind === 'current'
                ? 'var(--main-700)'
                : 'var(--main-500)';
          // 호버가 없을 때만 오늘 지점 값 라벨을 상시 노출(호버 시엔 툴팁으로 대체).
          const showCurrentLabel =
            !compact && isCurrent && datum.count > 0 && hoverIndex === null;
          // 툴팁 가로 위치 — 양 끝 점은 카드 밖으로 새지 않게 정렬 기준을 바꾼다.
          const tooltipAlign =
            point.xPct < 12 ? 'left' : point.xPct > 88 ? 'right' : 'center';
          const tooltipTransform =
            tooltipAlign === 'left'
              ? 'translate(0, -100%)'
              : tooltipAlign === 'right'
                ? 'translate(-100%, -100%)'
                : 'translate(-50%, -100%)';
          return (
            <React.Fragment key={`${datum.bucket}-${index}`}>
              {showCurrentLabel ? (
                <Text
                  size="caption5"
                  weight="bold"
                  className="text-main-700 absolute -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${point.xPct}%`,
                    top: `calc(${point.yPct}% - 8px)`,
                  }}
                >
                  {datum.count}
                </Text>
              ) : null}
              <span
                aria-hidden
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full',
                  'transition-all duration-150 ease-out'
                )}
                style={{
                  left: `${point.xPct}%`,
                  top: `${point.yPct}%`,
                  width: size,
                  height: size,
                  backgroundColor: bg,
                  boxShadow:
                    kind === 'zero' ? undefined : '0 0 0 2px var(--white)',
                }}
              />
              {/* 히트 타깃 — 점이 작아 최소 터치 영역을 확보한다(호버/포커스/터치). */}
              <button
                type="button"
                aria-label={`${datum.label} ${datum.count}개`}
                className={cn(
                  'absolute z-[1] h-7 w-7 -translate-x-1/2 -translate-y-1/2',
                  'rounded-full focus:outline-none'
                )}
                style={{ left: `${point.xPct}%`, top: `${point.yPct}%` }}
                onPointerEnter={() => setHoverIndex(index)}
                onPointerLeave={() => clearHover(index)}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => clearHover(index)}
              />
              {isHover ? (
                <div
                  role="tooltip"
                  className={cn(
                    'pointer-events-none absolute z-10 flex items-baseline',
                    'gap-1 whitespace-nowrap rounded-[8px] border',
                    'border-gray-200 bg-white px-2 py-1 shadow-sm'
                  )}
                  style={{
                    left: `${point.xPct}%`,
                    top: `calc(${point.yPct}% - 10px)`,
                    transform: tooltipTransform,
                  }}
                >
                  <Text size="caption5" className="text-gray-500">
                    {datum.label}
                  </Text>
                  <Text
                    size="caption5"
                    weight="bold"
                    className="text-gray-800"
                  >
                    {datum.count}개
                  </Text>
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      {/* 날짜 라벨 — 점과 동일한 xPct 에 중앙 정렬로 배치해 정렬을 맞춘다. */}
      <div className="relative mt-2 h-4">
        {points.map((point, index) => (
          <Text
            key={`${data[index].bucket}-label-${index}`}
            size="caption5"
            className={cn(
              'absolute -translate-x-1/2 whitespace-nowrap',
              'text-center',
              index === currentIndex
                ? 'text-main-700 font-bold'
                : 'text-gray-400'
            )}
            style={{ left: `${point.xPct}%` }}
          >
            {data[index].label}
          </Text>
        ))}
      </div>
    </div>
  );
}
