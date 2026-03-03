// components/ChallengeGoalToggle.tsx

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check } from 'lucide-react';
import React from 'react';

// props는 기존과 동일하게 선언
export interface ChallengeGoalToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked: boolean;
  onCheckedChange?(newChecked: boolean): void;
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
    <label
      className={cn(
        'inline-flex cursor-pointer items-center',
        disabled && 'pointer-events-none',
        className
      )}
    >
      <SwitchPrimitive.Root
        className={cn(
          'relative inline-flex h-4 w-4 items-center justify-center',
          'rounded focus:outline-none',
          'data-[state=checked]:bg-main-900 bg-gray-200'
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
      <Text size={'body2'} weight={'regular'} className="ml-2">
        {label}
      </Text>
    </label>
  )
);

ChallengeGoalToggle.displayName = 'ChallengeGoalToggle';
