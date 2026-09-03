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

// 12시 방향 기준 각도(deg) → 원 위의 좌표.
function pointAt(angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [
    CENTER + RADIUS * Math.cos(rad),
    CENTER + RADIUS * Math.sin(rad),
  ];
}

// 시계 방향 아크 패스. dasharray 원 트릭 대신 명시적 패스로 그려
// 브라우저별 dash 렌더링 아티팩트를 피한다.
function arcPath(startDeg: number, endDeg: number): string {
  const [sx, sy] = pointAt(startDeg);
  const [ex, ey] = pointAt(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${ex} ${ey}`;
}

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

  const visible = segments.filter((seg) => seg.value > 0);
  let accDeg = 0;
  const arcs =
    total > 0
      ? visible.map((seg) => {
          const startDeg = accDeg;
          const sweep = (seg.value / total) * 360;
          accDeg += sweep;
          // 단일 세그먼트 100% 는 아크로 못 그리므로 원으로 대체.
          if (visible.length === 1) {
            return (
              <circle
                key={seg.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
              />
            );
          }
          return (
            <path
              key={seg.key}
              d={arcPath(startDeg, accDeg)}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
            />
          );
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
        {arcs}
      </svg>
      {centerSlot ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerSlot}
        </div>
      ) : null}
    </div>
  );
}
