'use client';

import { Text } from '@1d1s/design-system';
import type { NoticeItem } from '@constants/consts/noticeData';
import { cn } from '@module/utils/cn';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  공지: 'bg-gray-100 text-gray-700',
  점검: 'bg-amber-100 text-amber-700',
  업데이트: 'bg-main-50 text-main-800',
  이벤트: 'bg-rose-100 text-rose-700',
};

interface NoticeDetailScreenProps {
  notice: NoticeItem;
}

export function NoticeDetailScreen({
  notice,
}: NoticeDetailScreenProps): React.ReactElement {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-white pt-14 lg:pt-0">
      <div
        className={cn(
          'fixed top-0 right-0 left-0 z-30 flex h-14 items-center gap-3',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 truncate tracking-[-0.3px] text-gray-900"
        >
          공지사항
        </Text>
      </div>

      <section
        className={cn(
          'mx-auto w-full max-w-[820px]',
          'px-5 py-5 lg:px-8 lg:py-10'
        )}
      >
        <header
          className={cn(
            'flex flex-col gap-3 border-b border-gray-100 pb-5',
            'lg:pb-6'
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5',
                'text-[11px] font-bold',
                CATEGORY_BADGE_CLASS[notice.category] ??
                  'bg-gray-100 text-gray-700'
              )}
            >
              {notice.category}
            </span>
            <Text size="caption2" weight="regular" className="text-gray-400">
              {notice.createdAt}
            </Text>
          </div>
          <Text
            as="h1"
            size="heading2"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            {notice.title}
          </Text>
        </header>

        <article className="mt-6 lg:mt-8">
          <Text
            size="body2"
            weight="regular"
            className="leading-7 whitespace-pre-line text-gray-700"
          >
            {notice.body}
          </Text>
        </article>
      </section>
    </div>
  );
}
