'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { Check } from 'lucide-react';
import React from 'react';

export interface ChallengeGoalToggleProps
  extends React.ComponentPropsWithoutRef<'button'> {
  checked: boolean;
  onCheckedChange?(newChecked: boolean): void;
  label: string;
  disabled?: boolean;
}

export const ChallengeGoalToggle = React.forwardRef<
  HTMLButtonElement,
  ChallengeGoalToggleProps
>(
  (
    { checked, onCheckedChange, label, disabled = false, className, ...props },
    ref
  ) => {
    const toggle = (): void => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div
        className={cn(
          'inline-flex cursor-pointer items-center',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        onClick={toggle}
      >
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          ref={ref}
          className={cn(
            'relative inline-flex h-4 w-4 items-center justify-center',
            'rounded transition-colors duration-200 focus:outline-none',
            checked ? 'bg-main-900' : 'bg-gray-200'
          )}
          {...props}
        >
          <span
            className={cn(
              'flex items-center justify-center text-white transition-opacity duration-200',
              checked ? 'opacity-100' : 'opacity-0',
              'h-full w-full'
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        </button>
        <Text size={'body2'} weight={'regular'} className="ml-2">
          {label}
        </Text>
      </div>
    );
  }
);

ChallengeGoalToggle.displayName = 'ChallengeGoalToggle';
