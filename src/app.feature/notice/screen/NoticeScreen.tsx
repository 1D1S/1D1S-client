'use client';

import { Text } from '@1d1s/design-system';
import { NOTICE_ITEMS } from '@constants/consts/noticeData';
import { cn } from '@module/utils/cn';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  공지: 'bg-gray-100 text-gray-700',
  점검: 'bg-amber-100 text-amber-700',
  업데이트: 'bg-main-50 text-main-800',
  이벤트: 'bg-rose-100 text-rose-700',
};

export function NoticeScreen(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full pt-14 lg:pt-0">
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
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          공지사항
        </Text>
      </div>

      <section className="mx-auto w-full max-w-[980px] p-4 lg:p-6">
        <div className="hidden border-b border-gray-200 pb-5 lg:block">
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            공지사항
          </Text>
          <Text
            size="body2"
            weight="regular"
            className="mt-2 block text-gray-500"
          >
            서비스 업데이트와 안내사항을 확인하세요.
          </Text>
        </div>

        <div className="mt-6">
          <ul
            className={cn(
              'rounded-4 divide-y divide-gray-100 border border-gray-200',
              'bg-white'
            )}
          >
            {NOTICE_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/notice/${item.id}`}
                  className={cn(
                    'flex items-center gap-3 px-5 py-4 transition-colors',
                    'hover:bg-gray-50'
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5',
                      'text-[11px] font-bold',
                      CATEGORY_BADGE_CLASS[item.category] ??
                        'bg-gray-100 text-gray-700'
                    )}
                  >
                    {item.category}
                  </span>
                  <Text
                    size="body1"
                    weight="medium"
                    className="flex-1 truncate text-left text-gray-800"
                  >
                    {item.title}
                  </Text>
                  <Text
                    size="caption2"
                    weight="regular"
                    className="hidden shrink-0 text-gray-400 sm:block"
                  >
                    {item.createdAt}
                  </Text>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
