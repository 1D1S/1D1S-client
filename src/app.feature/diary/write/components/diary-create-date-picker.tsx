'use client';

import { Calendar } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import * as Popover from '@radix-ui/react-popover';
import { CalendarDays, ChevronDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface DiaryCreateDatePickerProps {
  value: Date | undefined;
  onChange(date: Date | undefined): void;
  disabledDateKeys: string[];
  challengeStartDate?: string;
  placeholder?: string;
  className?: string;
}

function formatDateLabel(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

function formatDateKey(date: Date): string {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const yyyy = normalizedDate.getFullYear();
  const mm = String(normalizedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(normalizedDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isWithinRecentThreeDays(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 2);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate >= minDate && targetDate <= today;
}

export function DiaryCreateDatePicker({
  value,
  onChange,
  disabledDateKeys,
  challengeStartDate,
  placeholder = '날짜를 선택해주세요',
  className,
}: DiaryCreateDatePickerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const disabledDateKeySet = useMemo(
    () => new Set(disabledDateKeys),
    [disabledDateKeys]
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'group rounded-3 flex h-10 w-full items-center justify-between gap-3 border border-gray-300 bg-white px-5',
            'transition-colors duration-200',
            'data-[state=open]:border-main-500 focus-visible:ring-main-300/60 hover:border-gray-400 focus-visible:ring-3 focus-visible:outline-none',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-600" />
            <span
              className={cn(
                'text-sm font-medium',
                value ? 'text-gray-900' : 'text-gray-500'
              )}
            >
              {value ? formatDateLabel(value) : placeholder}
            </span>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-600" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            'rounded-4 z-50 w-auto border border-gray-300 bg-white p-2 text-gray-900',
            'shadow-[0_10px_20px_rgba(34,34,34,0.12)] outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              if (date) {
                setOpen(false);
              }
            }}
            disabled={(date) => {
              if (!isWithinRecentThreeDays(date)) {
                return true;
              }
              if (challengeStartDate) {
                const start = new Date(challengeStartDate);
                start.setHours(0, 0, 0, 0);
                const target = new Date(date);
                target.setHours(0, 0, 0, 0);
                if (target < start) {
                  return true;
                }
              }
              return disabledDateKeySet.has(formatDateKey(date));
            }}
            initialFocus
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
