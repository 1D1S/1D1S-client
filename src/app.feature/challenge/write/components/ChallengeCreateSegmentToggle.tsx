import { cn } from '@module/utils/cn';
import type { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ChallengeCreateSegmentToggleProps<T extends string> {
  value: T;
  onChange(value: T): void;
  options: ReadonlyArray<SegmentOption<T>>;
  ariaLabel?: string;
}

export function ChallengeCreateSegmentToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: ChallengeCreateSegmentToggleProps<T>): React.ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'grid gap-2 rounded-2xl bg-gray-100 p-1',
        options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      )}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-[9px]',
              'px-3 py-2.5 text-[13px] font-bold transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'text-main-800 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            {option.icon ? (
              <span className="text-sm leading-none">{option.icon}</span>
            ) : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
