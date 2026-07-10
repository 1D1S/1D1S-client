import { cn } from '@module/utils/cn';
import React from 'react';

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  /** 직경(px) */
  size?: number;
  /** 도넛 두께(px) */
  thickness?: number;
  /** 가운데 노드 */
  centerSlot?: React.ReactNode;
  /** 스크린리더용 차트 설명 */
  ariaLabel?: string;
  className?: string;
}

// 100x100 viewBox 좌표계. 렌더 크기(size)와 무관하게 SVG가 스케일된다.
const VIEW = 100;
const CENTER = VIEW / 2;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * 순수 SVG 도넛 차트 (외부 의존성 없음).
 * 값 합이 0이면 회색 트랙만 그린다.
 */
export function DonutChart({
  segments,
  size = 160,
  thickness = 26,
  centerSlot,
  ariaLabel,
  className,
}: DonutChartProps): React.ReactElement {
  const total = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0);
  // px 두께를 viewBox 단위로 환산 (scale = size/VIEW).
  const strokeWidth = (thickness / size) * VIEW;

  let offset = 0;
  const arcs =
    total > 0
      ? segments
          .filter((seg) => seg.value > 0)
          .map((seg) => {
            const dash = (seg.value / total) * CIRCUMFERENCE;
            const arc = (
              <circle
                key={seg.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return arc;
          })
      : [];

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={size}
        height={size}
        role="img"
        aria-label={ariaLabel}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth={strokeWidth}
        />
        {/* -90deg 회전으로 12시 방향에서 시작 */}
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>{arcs}</g>
      </svg>
      {centerSlot ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerSlot}
        </div>
      ) : null}
    </div>
  );
}
