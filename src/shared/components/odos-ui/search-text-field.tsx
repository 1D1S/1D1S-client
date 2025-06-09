'use client';

import { Input } from '@/shared/components/ui/input';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { odosLabelVariants } from './label';

interface SearchTextFieldProps extends React.ComponentProps<typeof Input> {
  placeholder?: string;
}

export function SearchTextField({ className, ...props }: SearchTextFieldProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full">
        <Input
          className={cn(
            odosLabelVariants({ size: 'body2', weight: 'light' }),
            'h-auto w-full rounded-full border-gray-400 px-3 py-2 pr-10 text-2xl font-light text-gray-900 shadow-none placeholder:text-gray-900',
            'focus-visible:ring-main-700 focus-visible:border-1 focus-visible:border-gray-400 focus-visible:bg-white focus-visible:ring-0 focus-visible:outline-none',
            className
          )}
          {...props}
        />
        <Image
          src="/images/search.png"
          alt="icon"
          width={16}
          height={16}
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
        />
      </div>
    </div>
  );
}
