import { cn } from '@module/utils/cn';
import React from 'react';

type SkeletonShape = 'rect' | 'rounded' | 'pill' | 'circle' | 'text';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  /**
   * 펄스 애니메이션 여부. 기본 true.
   *
   * false 는 "곧 실제 값으로 채워질 자리"를 조용히 잡아둘 때 쓴다. 이미
   * 실제 콘텐츠(제목·소개 등)가 보이는 화면에 펄스가 섞이면, 사용자
   * 눈에는 로딩이 아니라 화면이 번쩍이는 것으로 읽힌다.
   */
  pulse?: boolean;
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
  pulse = true,
  className,
  ...rest
}: SkeletonProps): React.ReactElement {
  return (
    <div
      aria-hidden
      className={cn(
        pulse && 'skeleton-pulse',
        'bg-gray-200/80',
        SHAPE_CLASS[shape],
        className
      )}
      {...rest}
    />
  );
}
