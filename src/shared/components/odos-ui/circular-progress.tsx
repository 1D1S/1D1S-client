'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { OdosLabel } from './label';

type LabelSize = VariantProps<typeof import('./label').odosLabelVariants>['size'];

const circularProgressVariants = cva('', {
  variants: {
    size: {
      sm: 'w-7.5 h-7.5',
      md: 'w-10 h-10',
      lg: 'w-20 h-20',
      xl: 'w-30 h-30',
    },
    strokeWidthVariant: {
      sm: '[stroke-width:5]',
      md: '[stroke-width:7]',
      lg: '[stroke-width:14]',
      xl: '[stroke-width:21]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type CircularProgressVariants = VariantProps<typeof circularProgressVariants>;

interface CircularProgressProps extends CircularProgressVariants {
  value: number;
  color?: 'blue' | 'green' | 'red';
  showPercentage?: boolean;
  className?: string;
}

/**
 * CircularProgress
 * 원형 진행률 표시 컴포넌트
 *
 * @param value 진행률 (0~100)
 * @param size 크기 (sm, md, lg, xl)
 * @param color 색상 (red, blue, green)
 * @param showPercentage 퍼센트 표시 여부
 * @param className 추가 클래스 이름
 *
 * @example 기본 사용
 * ```tsx
 * <CircularProgress value={75} size="md" color="red" showPercentage />
 * ```
 */
export function CircularProgress({
  value,
  size,
  color = 'red',
  showPercentage = false,
  className,
}: CircularProgressProps): React.ReactElement {
  const sizeKey = size ?? 'md';

  const baseSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
    sm: 30,
    md: 40,
    lg: 80,
    xl: 120,
  };
  const strokeWidthMap: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
    sm: 5,
    md: 7,
    lg: 14,
    xl: 21,
  };

  const fontSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', LabelSize> = {
    sm: 'caption3',
    md: 'caption2',
    lg: 'caption1',
    xl: 'heading2',
  };

  const baseSize = baseSizeMap[sizeKey];
  const strokeWidth = strokeWidthMap[sizeKey];

  const radius = (baseSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const finalOffset = circumference - (circumference * clampedValue) / 100;

  const [animatedOffset, setAnimatedOffset] = useState<number>(circumference);

  useEffect(() => {
    setAnimatedOffset(finalOffset);
  }, [finalOffset]);

  const wrapperClasses = cn(
    circularProgressVariants({ size: sizeKey, strokeWidthVariant: sizeKey }),
    'rounded-full',
    className
  );

  const colorMap: Record<string, string> = {
    red: 'stroke-main-500',
    blue: 'stroke-blue-200',
    green: 'stroke-green-200',
  };
  const colorClass = colorMap[color] ?? 'stroke-gray-200';

  const progressColorMap: Record<string, string> = {
    red: 'stroke-main-900',
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
  };
  const progressColorClass = progressColorMap[color] ?? 'stroke-blue-500';
  const trackClasses = cn(colorClass, `[stroke-width:${strokeWidth}]`);
  const progressClasses = cn(progressColorClass, `[stroke-width:${strokeWidth}]`);

  return (
    <div className="relative inline-block">
      <svg viewBox={`0 0 ${baseSize} ${baseSize}`} className={wrapperClasses}>
        <circle
          cx={baseSize / 2}
          cy={baseSize / 2}
          r={radius}
          fill="none"
          className={trackClasses}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
        />

        <circle
          cx={baseSize / 2}
          cy={baseSize / 2}
          r={radius}
          fill="none"
          className={progressClasses}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          transform={`rotate(-90 ${baseSize / 2} ${baseSize / 2})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          strokeLinecap="round"
        />
      </svg>

      {showPercentage && (
        <OdosLabel
          className="absolute inset-0 flex items-center justify-center text-black"
          size={fontSizeMap[sizeKey]}
          weight="bold"
        >
          {`${clampedValue}%`}
        </OdosLabel>
      )}
    </div>
  );
}
