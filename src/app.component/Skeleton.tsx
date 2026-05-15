import { cn } from '@module/utils/cn';
import React from 'react';

type SkeletonShape = 'rect' | 'rounded' | 'pill' | 'circle' | 'text';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
}

const SHAPE_CLASS: Record<SkeletonShape, string> = {
  rect: '',
  rounded: 'rounded-md',
  pill: 'rounded-full',
  circle: 'rounded-full',
  text: 'rounded-sm',
};

export function Skeleton({
  shape = 'rounded',
  className,
  ...rest
}: SkeletonProps): React.ReactElement {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse bg-gray-200/80',
        SHAPE_CLASS[shape],
        className
      )}
      {...rest}
    />
  );
}
