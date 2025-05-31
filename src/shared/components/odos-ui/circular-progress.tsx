'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const circularProgressVariants = cva('', {
  variants: {
    size: {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
    },
    strokeWidthVariant: {
      thin: '[stroke-width:2]',
      medium: '[stroke-width:4]',
      thick: '[stroke-width:6]',
    },
  },
  defaultVariants: {
    size: 'md',
    strokeWidthVariant: 'medium',
  },
});

export type CircularProgressVariants = VariantProps<typeof circularProgressVariants>;

interface CircularProgressProps extends CircularProgressVariants {
  value: number;
  trackColor?: 'gray' | 'blue' | 'green' | 'red';
  progressColor?: 'blue' | 'green' | 'red' | 'primary';
  className?: string;
}

export function CircularProgress({
  value,
  size,
  strokeWidthVariant,
  trackColor = 'gray',
  progressColor = 'red',
  className,
}: CircularProgressProps): React.ReactElement {
  const sizeKey = size ?? 'md';
  const strokeKey = strokeWidthVariant ?? 'medium';

  const baseSizeMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: 24,
    md: 32,
    lg: 40,
  };
  const strokeWidthMap: Record<'thin' | 'medium' | 'thick', number> = {
    thin: 2,
    medium: 4,
    thick: 6,
  };

  const baseSize = baseSizeMap[sizeKey];
  const strokeWidth = strokeWidthMap[strokeKey];

  const radius = (baseSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (circumference * clampedValue) / 100;

  const wrapperClasses = cn(
    circularProgressVariants({ size: sizeKey, strokeWidthVariant: strokeKey }),
    'rounded-full',
    className
  );

  const trackColorMap: Record<string, string> = {
    gray: 'stroke-gray-200',
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
  };
  const trackColorClass = trackColorMap[trackColor] ?? 'stroke-gray-200';

  const progressColorMap: Record<string, string> = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    primary: 'stroke-primary-500',
  };
  const progressColorClass = progressColorMap[progressColor] ?? 'stroke-blue-500';

  const trackClasses = cn(trackColorClass, `[stroke-width:${strokeWidth}]`);

  const progressClasses = cn(progressColorClass, `[stroke-width:${strokeWidth}]`);

  return (
    <svg viewBox={`0 0 ${baseSize} ${baseSize}`} className={wrapperClasses}>
      <circle
        cx={baseSize / 2}
        cy={baseSize / 2}
        r={radius}
        fill="none"
        className={trackClasses}
        strokeDasharray={circumference}
        strokeDashoffset={0}
      />

      <circle
        cx={baseSize / 2}
        cy={baseSize / 2}
        r={radius}
        fill="none"
        className={progressClasses}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${baseSize / 2} ${baseSize / 2})`}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        strokeLinecap="round"
      />
    </svg>
  );
}
