import { cn } from '@1d1s/design-system';
import { Flag } from 'lucide-react';
import React from 'react';

export type ChallengeChipSize = 'xs' | 'sm';

interface BaseProps {
  title: string;
  size?: ChallengeChipSize;
  className?: string;
}

interface ButtonProps extends BaseProps {
  onClick(event: React.MouseEvent<HTMLButtonElement>): void;
}

interface SpanProps extends BaseProps {
  onClick?: undefined;
}

const SIZE_CLASS: Record<ChallengeChipSize, string> = {
  xs: 'gap-1 rounded-full px-2 py-0.5 text-[11px]',
  sm: 'gap-1.5 rounded-full px-3 py-1.5 text-xs',
};

const ICON_SIZE: Record<ChallengeChipSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
};

export function ChallengeChip({
  title,
  size = 'sm',
  className,
  onClick,
}: ButtonProps | SpanProps): React.ReactElement {
  const baseClass = cn(
    'inline-flex max-w-full items-center font-bold',
    'border-main-200 bg-main-100 text-main-800 border',
    SIZE_CLASS[size],
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          baseClass,
          'hover:bg-main-200/50 cursor-pointer transition-colors'
        )}
      >
        <Flag className={cn('shrink-0', ICON_SIZE[size])} />
        <span className="truncate">{title}</span>
      </button>
    );
  }

  return (
    <span className={baseClass}>
      <Flag className={cn('shrink-0', ICON_SIZE[size])} />
      <span className="truncate">{title}</span>
    </span>
  );
}
