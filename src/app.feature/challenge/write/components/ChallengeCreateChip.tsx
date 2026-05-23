import { cn } from '@module/utils/cn';
import type { ReactNode } from 'react';

interface ChallengeCreateChipProps {
  active: boolean;
  onClick(): void;
  children: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function ChallengeCreateChip({
  active,
  onClick,
  children,
  icon,
  ariaLabel,
  size = 'md',
  disabled,
}: ChallengeCreateChipProps): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        'font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-2 text-[12px]',
        active
          ? 'border-main-800 bg-main-800 text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      )}
    >
      {icon ? <span className="text-[13px] leading-none">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
