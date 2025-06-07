// components/ChallengeGoalToggle.tsx

import { OdosLabel } from '@/shared/components/odos-ui/label';
import { cn } from '@/shared/lib/utils';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check } from 'lucide-react';
import React from 'react';

// props는 기존과 동일하게 선언
export interface ChallengeGoalToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked: boolean;
  onCheckedChange(newChecked: boolean): void;
  label: string;
  disabled?: boolean;
}

export const ChallengeGoalToggle = React.forwardRef(
  (
    {
      checked,
      onCheckedChange,
      label,
      disabled = false,
      className,
      ...props
    }: ChallengeGoalToggleProps,
    ref
  ) => (
    <label className={cn('inline-flex cursor-pointer items-center select-none', className)}>
      <SwitchPrimitive.Root
        className={cn(
          'relative inline-flex h-4 w-4 items-center justify-center',
          'rounded focus:outline-none',
          disabled ? 'bg-gray-200' : 'data-[state=checked]:bg-main-900 bg-gray-200'
        )}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        ref={ref as React.Ref<React.ElementRef<typeof SwitchPrimitive.Root>>}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'flex items-center justify-center text-white opacity-0 data-[state=checked]:opacity-100',
            'h-full w-full'
          )}
          asChild
        >
          <Check className="h-4 w-4" />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      <OdosLabel size={'body2'} weight={'regular'} className="ml-2">
        {label}
      </OdosLabel>
    </label>
  )
);

ChallengeGoalToggle.displayName = 'ChallengeGoalToggle';
