import { NOTICE_ITEMS } from '@constants/consts/noticeData';
import { cn } from '@module/utils/cn';
import { ChevronRight, Megaphone } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function HomeNoticeStrip(): React.ReactElement | null {
  const [latest] = NOTICE_ITEMS;
  if (!latest) {
    return null;
  }

  return (
    <div className="w-full">
      <Link
        href="/notice"
        className={cn(
          'flex w-full cursor-pointer items-center gap-3',
          'rounded-4 border border-gray-200 bg-white px-4 py-3',
          'text-gray-800 transition',
          'hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <span
          className={cn(
            'inline-flex h-7 w-7 shrink-0 items-center justify-center',
            'rounded-full bg-gray-100 text-gray-700'
          )}
        >
          <Megaphone className="h-3.5 w-3.5" />
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full bg-gray-100 px-2 py-0.5',
            'text-[11px] font-bold text-gray-700'
          )}
        >
          공지
        </span>
        <span className="flex-1 truncate text-sm font-medium">
          {latest.title}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
      </Link>
    </div>
  );
}
