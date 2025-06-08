// import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { OdosLabel } from './label';

export function OdosDatePicker({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange(date: Date | undefined): void;
}): React.ReactElement {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-50 border-none bg-white hover:bg-white',
            'text-gray-900 inset-ring-[1px] inset-ring-gray-400',
            'flex justify-between'
          )}
        >
          {value ? (
            <OdosLabel size="body2" weight="regular">
              {format(value, 'yyyy-MM-dd')}
            </OdosLabel>
          ) : (
            <OdosLabel size="body2" weight="regular">
              날짜를 선택해주세요.
            </OdosLabel>
          )}

          <CalendarIcon size="16" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
