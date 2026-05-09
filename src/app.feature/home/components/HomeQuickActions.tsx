import { Icon } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function HomeQuickActions(): React.ReactElement {
  return (
    <div className="w-full">
      <Link
        href="/inquiry"
        className={cn(
          'flex w-full cursor-pointer items-center gap-3',
          'rounded-4 border-main-200 border bg-white px-4 py-3',
          'text-gray-800 transition',
          'hover:border-main-300 hover:bg-main-100'
        )}
      >
        <span
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center',
            'bg-main-200 text-brand rounded-full'
          )}
        >
          <Icon name="PencilLine" size={14} />
        </span>
        <span className="text-sm font-medium">의견을 들려주세요</span>
        <span
          className={cn(
            'ml-auto inline-flex items-center gap-0.5',
            'text-brand text-xs font-bold'
          )}
        >
          문의하기
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </div>
  );
}
