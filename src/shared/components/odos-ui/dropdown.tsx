'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import {
  Select as OdosSelect,
  SelectGroup as OdosSelectGroup,
  SelectValue as OdosSelectValue,
} from '@/shared/components/ui/select';

import { cn } from '@/shared/lib/utils';
import { OdosLabel } from './label';

/**
 * OdosSelectTrigger
 * Select 기본 트리거 컴포넌트
 *
 * @example
 * ```tsx
 * <OdosSelectTrigger className="w-[180px]">
 *   <OdosSelectValue placeholder="값을 선택해주세요" />
 * </OdosSelectTrigger>
 * ```
 */
function OdosSelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}): React.ReactElement {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'rounded-odos-2 h-auto min-w-[150px] items-center gap-0 bg-white p-3 inset-ring-[1px] inset-ring-gray-400 data-[placeholder]:text-gray-500 data-[size=default]:h-auto data-[size=sm]:h-auto',
        className
      )}
      {...props}
    >
      <OdosLabel size="body2" weight="regular">
        {children}
      </OdosLabel>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * OdosSelectItem
 * Select 기본 아이템 컴포넌트
 *
 * @example
 * ```tsx
 * <OdosSelectItem value="option1">value1</OdosSelectItem>
 * ```
 */
function OdosSelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>): React.ReactElement {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        'gap-3 px-2 py-1.5 text-black focus:bg-gray-300 focus:text-black',
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        <OdosLabel size="body2" weight="regular">
          {children}
        </OdosLabel>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/**
 * OdosSelectSeparator
 * Select 구분선 컴포넌트
 */
function OdosSelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>): React.ReactElement {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        'bg-border pointer-events-none -mx-1 my-1 h-px',
        '-mx-0 bg-gray-300',
        className
      )}
      {...props}
    />
  );
}

function OdosSelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>): React.ReactElement {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function OdosSelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>): React.ReactElement {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

/**
 * OdosSelectContent
 * Select 기본 컨텐츠 컴포넌트
 *
 * @example
 * ```tsx
 * <OdosSelectContent>
 *   <OdosSelectGroup>
 *     <OdosSelectItem value="option1">Option 1</OdosSelectItem>
 *     <OdosSelectItem value="option2">Option 2</OdosSelectItem>
 *   </OdosSelectGroup>
 * </OdosSelectContent>
 * ```
 */
function OdosSelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>): React.ReactElement {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          'shadow-odos-default border-none bg-white',
          className
        )}
        position={position}
        {...props}
      >
        <OdosSelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <OdosSelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function OdosSelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>): React.ReactElement {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
}

export {
  OdosSelect,
  OdosSelectContent,
  OdosSelectGroup,
  OdosSelectItem,
  OdosSelectLabel,
  OdosSelectScrollDownButton,
  OdosSelectScrollUpButton,
  OdosSelectSeparator,
  OdosSelectTrigger,
  OdosSelectValue,
};
